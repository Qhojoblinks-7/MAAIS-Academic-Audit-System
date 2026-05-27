import { auditTrail } from './auditTrailService';
import { hodService } from './hodService';

/**
 * TransactionService - Provides ACID-like transaction handling for frontend operations
 * 
 * Since we're working with a REST API (not a transactional database), true ACID
 * transactions aren't possible at the frontend level. This service provides:
 * 1. Coordinated execution of multiple operations
 * 2. Rollback mechanisms for state changes
 * 3. Audit trail logging for transaction tracking
 * 4. Compensating transaction support where possible
 */
class TransactionService {
  constructor() {
    this.pendingOperations = [];
    this.inTransaction = false;
  }

  /**
   * Begin a new transaction
   * @returns {Object} Transaction context
   */
  beginTransaction() {
    if (this.inTransaction) {
      throw new Error('Already in a transaction');
    }
    
    this.inTransaction = true;
    this.pendingOperations = [];
    
    return {
      addOperation: this.addOperation.bind(this),
      commit: this.commit.bind(this),
      rollback: this.rollback.bind(this)
    };
  }

  /**
   * Add an operation to the transaction
   * @param {Function} operation - Function that returns a promise for the operation
   * @param {Function} compensation - Function that returns a promise to compensate/rollback the operation
   * @param {Object} metadata - Metadata for audit logging
   */
  addOperation(operation, compensation, metadata = {}) {
    if (!this.inTransaction) {
      throw new Error('Not in a transaction');
    }
    
    this.pendingOperations.push({
      operation,
      compensation,
      metadata,
      executed: false,
      compensated: false
    });
  }

  /**
   * Commit the transaction - execute all operations
   * @returns {Promise<Array>} Results of all operations
   */
  async commit() {
    if (!this.inTransaction) {
      throw new Error('Not in a transaction');
    }
    
    try {
      // Execute all operations in sequence
      const results = [];
      for (let i = 0; i < this.pendingOperations.length; i++) {
        const op = this.pendingOperations[i];
        try {
          const result = await op.operation();
          op.executed = true;
          op.result = result;
          results.push(result);
          
          // Log to audit trail
          await auditTrail.logChange(
            op.metadata.entityType || 'transaction',
            op.metadata.entityId || `txn-${Date.now()}-${i}`,
            op.metadata.oldValue || null,
            op.metadata.newValue || result,
            op.metadata.justification || 'Transaction operation',
            { ...op.metadata, type: 'operation', index: i }
          );
        } catch (error) {
          // If any operation fails, rollback all executed operations
          await this.rollback(i);
          throw new Error(`Transaction failed at operation ${i}: ${error.message}`);
        }
      }
      
      this.inTransaction = false;
      const txnResults = results;
      this.pendingOperations = [];
      return txnResults;
    } catch (error) {
      // Ensure we cleanup state even on unexpected errors
      this.inTransaction = false;
      throw error;
    }
  }

  /**
   * Rollback the transaction - execute compensating transactions for executed operations
   * @param {number} startIndex - Index to start rollback from (default: all executed operations)
   * @returns {Promise<void>}
   */
  async rollback(startIndex = 0) {
    if (!this.inTransaction) {
      throw new Error('Not in a transaction');
    }
    
    // Rollback operations in reverse order (LIFO)
    for (let i = this.pendingOperations.length - 1; i >= startIndex; i--) {
      const op = this.pendingOperations[i];
      if (op.executed && op.compensation && !op.compensated) {
        try {
          await op.compensation();
          op.compensated = true;
          
          // Log compensation to audit trail
          await auditTrail.logChange(
            op.metadata.entityType || 'transaction',
            op.metadata.entityId || `txn-${Date.now()}-${i}`,
            op.metadata.newValue || op.result,
            op.metadata.oldValue || null,
            'Compensating transaction (rollback)',
            { ...op.metadata, type: 'compensation', index: i, originalOperation: true }
          );
        } catch (error) {
          // Log compensation failure but continue with other rollbacks
          console.error(`Compensation failed for operation ${i}:`, error);
          await auditTrail.logChange(
            op.metadata.entityType || 'transaction',
            op.metadata.entityId || `txn-${Date.now()}-${i}`,
            null,
            null,
            `Compensation failed: ${error.message}`,
            { ...op.metadata, type: 'compensation_failure', index: i, error: error.message }
          );
        }
      }
    }
    
    this.inTransaction = false;
    this.pendingOperations = [];
  }

  /**
   * Execute a transaction immediately
   * @param {Array} operations - Array of {operation, compensation, metadata} objects
   * @returns {Promise<Array>} Results of all operations
   */
  async execute(operations) {
    const txn = this.beginTransaction();
    try {
      for (const op of operations) {
        txn.addOperation(op.operation, op.compensation, op.metadata);
      }
      return await txn.commit();
    } catch (error) {
      await txn.rollback();
      throw error;
    }
  }
}

export const transactionService = new TransactionService();

/**
 * Helper function to create a compensating operation for state updates
 * @param {Function} setter - State setter function (e.g., setState)
 * @param {any} previousValue - The value to restore
 * @returns {Function} Compensation function
 */
export const createStateCompensation = (setter, previousValue) => {
  return async () => {
    setter(previousValue);
  };
};

/**
 * Helper function to create a compensating API call
 * @param {Function} apiCall - The API call to compensate (should be inverse operation)
 * @param {any} args - Arguments for the compensating API call
 * @returns {Function} Compensation function
 */
export const createAPICompensation = (apiCall, ...args) => {
  return async () => {
    return apiCall(...args);
  };
};