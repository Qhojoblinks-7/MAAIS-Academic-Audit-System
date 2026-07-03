export const MOCK_PARENTS = [
  {
    id: 'PAR001',
    name: 'Mr. Emmanuel Osei',
    phone: '+233 24 455 0101',
    email: 'e.osei@gmail.com',
    wards: [
      { id: 'STU001', name: 'Kofi Mensah', averageScore: 82.4, attendance: 95, feesStatus: 'Free SHS', balance: 0 }
    ],
    lastContacted: '2 days ago',
    lastMessage: 'SMS: WASSCE Registration Portal Closing.',
    appAdopted: true,
    accessCode: 'A-7782',
    pin: '1234',
    isPTAExecutive: true,
    ptaRole: 'Chairperson',
    ptaAttendance: 100,
    communicationLogs: [
      { id: 'L001', type: 'SMS', content: 'WASSCE Registration Portal Closing.', timestamp: '2024-03-20 14:00', status: 'Delivered' },
      { id: 'L002', type: 'Email', content: 'PTA Meeting Invitation', timestamp: '2024-03-15 09:00', status: 'Sent' }
    ]
  },
  {
    id: 'PAR002',
    name: 'Mrs. Grace Boateng',
    phone: '+233 27 555 0102',
    email: 'g.boateng@outlook.com',
    wards: [
      { id: 'STU002', name: 'Abena Osei', averageScore: 38.5, attendance: 70, feesStatus: 'Free SHS', balance: 0 },
      { id: 'STU005', name: 'Yaw Ofori', averageScore: 52.1, attendance: 88, feesStatus: 'Free SHS', balance: 0 }
    ],
    lastContacted: '5 days ago',
    lastMessage: 'SMS: Free SHS Policy - No outstanding fees.',
    appAdopted: false,
    accessCode: 'A-1102',
    pin: '8892',
    isPTAExecutive: false,
    ptaAttendance: 40,
    communicationLogs: [
      { id: 'L003', type: 'SMS', content: 'Free SHS Policy - No outstanding fees.', timestamp: '2024-03-18 10:30', status: 'Delivered' }
    ]
  },
  {
    id: 'PAR003',
    name: 'Mr. Joshua Mensah',
    phone: '+233 20 111 0001',
    email: 'j.mensah@gh.me.com',
    wards: [
      { id: 'STU003', name: 'Kwame Boateng', averageScore: 74.2, attendance: 98, feesStatus: 'Gov\'t Covered', balance: 0 }
    ],
    lastContacted: '1 day ago',
    lastMessage: 'Email: Newsletter - March Edition.',
    appAdopted: true,
    accessCode: 'A-5521',
    pin: '0000',
    isPTAExecutive: true,
    ptaRole: 'Secretary',
    ptaAttendance: 90,
    communicationLogs: [
      { id: 'L004', type: 'Email', content: 'Newsletter - March Edition.', timestamp: '2024-03-21 16:15', status: 'Sent' }
    ]
  }
];

export const PTA_ROLES = ['Chairperson', 'Secretary', 'Treasurer', 'Member'];
export const BROADCAST_TEMPLATES = ['Custom Message', 'PTA Meeting Invitation', 'Terminal Report Dispatch', 'Re-opening Schedule', 'WASSCE Registration Portal Closing'];
export const PARENT_TARGET_POPULATIONS = ['All Guardians', 'SHS 3 Boarder Parents', 'Day Parent Protocol', 'Gov\'t Funded Wards'];