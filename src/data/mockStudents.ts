import { Student, LegacyRepertoirePiece } from '@/components/common/StudentCard';
import { DEV_STUDENT_UUIDS, DEV_LESSON_UUIDS, DEV_REPERTOIRE_UUIDS } from '@/lib/dev-uuids';

/**
 * Mock student data for testing and development
 */
export const students: Student[] = [
  {
    id: DEV_STUDENT_UUIDS.STUDENT_1,
    name: 'Emma Thompson',
    avatarUrl: '/images/girl1.jpg',
    level: 'Advanced',
    nextLesson: 'Tuesday, 3:30 PM',
    unreadMessages: 2,
    currentRepertoire: [
      { 
        id: DEV_REPERTOIRE_UUIDS.PIECE_1, 
        title: 'Bach Partita No. 2',
        composer: 'J.S. Bach',
        startDate: '2023-10-01',
        status: 'current',
        notes: 'Working on Chaconne section'
      } as LegacyRepertoirePiece,
      { 
        id: DEV_REPERTOIRE_UUIDS.PIECE_2, 
        title: 'Violin Concerto',
        composer: 'Korngold, 1st movement',
        startDate: '2023-09-15',
        status: 'current'
      } as LegacyRepertoirePiece
    ],
    pastRepertoire: [
      { 
        id: DEV_REPERTOIRE_UUIDS.PIECE_21, 
        title: 'A Minor Scale',
        composer: 'With emphasis on arpeggios',
        startDate: '2023-08-01',
        status: 'completed'
      } as LegacyRepertoirePiece,
      { 
        id: DEV_REPERTOIRE_UUIDS.PIECE_11, 
        title: 'Sonata No. 2',
        composer: 'Bach',
        startDate: '2023-07-15',
        status: 'completed'
      } as LegacyRepertoirePiece
    ],
    lessons: [
      {
        id: DEV_LESSON_UUIDS.LESSON_1,
        date: '2023-10-15',
        repertoire: [
          { 
            id: DEV_REPERTOIRE_UUIDS.PIECE_1, 
            title: 'Bach Partita No. 2',
            composer: 'J.S. Bach',
            startDate: '2023-10-01',
            status: 'current'
          } as LegacyRepertoirePiece,
          { 
            id: DEV_REPERTOIRE_UUIDS.PIECE_2, 
            title: 'Violin Concerto',
            composer: 'Korngold, 1st movement',
            startDate: '2023-09-15',
            status: 'current'
          } as LegacyRepertoirePiece
        ],
        summary: 'Worked on B Major scale with focus on intonation of thirds. Discussed fingering options.'
      }
    ]
  },
  {
    id: DEV_STUDENT_UUIDS.STUDENT_2,
    name: 'William Taylor',
    avatarUrl: '/images/boy3.jpg',
    level: 'Beginner',
    nextLesson: 'Wednesday, 4:00 PM',
    currentRepertoire: [
      { 
        id: DEV_REPERTOIRE_UUIDS.PIECE_22, 
        title: 'D Major Scale',
        composer: 'One octave',
        startDate: '2023-10-08',
        status: 'current'
      } as LegacyRepertoirePiece,
      { 
        id: DEV_REPERTOIRE_UUIDS.PIECE_24, 
        title: 'Spring',
        composer: 'Vivaldi, from Four Seasons',
        startDate: '2023-09-25',
        status: 'current'
      } as LegacyRepertoirePiece
    ],
    lessons: [
      {
        id: DEV_LESSON_UUIDS.LESSON_2,
        date: '2023-10-16',
        repertoire: [
          { 
            id: DEV_REPERTOIRE_UUIDS.PIECE_22, 
            title: 'D Major Scale',
            composer: 'One octave',
            startDate: '2023-10-08',
            status: 'current'
          } as LegacyRepertoirePiece,
          { 
            id: DEV_REPERTOIRE_UUIDS.PIECE_25, 
            title: 'Etude No. 3',
            composer: 'Wohlfahrt',
            startDate: '2023-10-05',
            status: 'current'
          } as LegacyRepertoirePiece
        ],
        summary: 'Practiced bow distribution for even tone. Discussed proper left hand position.'
      }
    ]
  }
]; 