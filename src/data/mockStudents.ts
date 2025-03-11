import { Student, LegacyRepertoirePiece } from '@/components/common/StudentCard';
import { ID_PREFIXES, createPrefixedId } from '@/lib/id-utils';

/**
 * Mock student data for testing and development
 */
export const students: Student[] = [
  {
    id: createPrefixedId(ID_PREFIXES.STUDENT, '1'),
    name: 'Emma Thompson',
    avatarUrl: '/images/girl1.jpg',
    level: 'Advanced',
    nextLesson: 'Tuesday, 3:30 PM',
    unreadMessages: 2,
    currentRepertoire: [
      { 
        id: '101', 
        title: 'Bach Partita No. 2',
        composer: 'J.S. Bach',
        startDate: '2023-10-01',
        status: 'current',
        notes: 'Working on Chaconne section'
      } as LegacyRepertoirePiece,
      { 
        id: '102', 
        title: 'Violin Concerto',
        composer: 'Korngold, 1st movement',
        startDate: '2023-09-15',
        status: 'current'
      } as LegacyRepertoirePiece
    ],
    pastRepertoire: [
      { 
        id: '104', 
        title: 'A Minor Scale',
        composer: 'With emphasis on arpeggios',
        startDate: '2023-08-01',
        status: 'completed'
      } as LegacyRepertoirePiece,
      { 
        id: '105', 
        title: 'Sonata No. 2',
        composer: 'Bach',
        startDate: '2023-07-15',
        status: 'completed'
      } as LegacyRepertoirePiece
    ],
    lessons: [
      {
        id: createPrefixedId(ID_PREFIXES.LESSON, '101'),
        date: '2023-10-15',
        repertoire: [
          { 
            id: '101', 
            title: 'Bach Partita No. 2',
            composer: 'J.S. Bach',
            startDate: '2023-10-01',
            status: 'current'
          } as LegacyRepertoirePiece,
          { 
            id: '102', 
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
    id: createPrefixedId(ID_PREFIXES.STUDENT, '2'),
    name: 'William Taylor',
    avatarUrl: '/images/boy3.jpg',
    level: 'Beginner',
    nextLesson: 'Wednesday, 4:00 PM',
    currentRepertoire: [
      { 
        id: '601', 
        title: 'D Major Scale',
        composer: 'One octave',
        startDate: '2023-10-08',
        status: 'current'
      } as LegacyRepertoirePiece,
      { 
        id: '602', 
        title: 'Spring',
        composer: 'Vivaldi, from Four Seasons',
        startDate: '2023-09-25',
        status: 'current'
      } as LegacyRepertoirePiece
    ],
    lessons: [
      {
        id: createPrefixedId(ID_PREFIXES.LESSON, '601'),
        date: '2023-10-16',
        repertoire: [
          { 
            id: '601', 
            title: 'D Major Scale',
            composer: 'One octave',
            startDate: '2023-10-08',
            status: 'current'
          } as LegacyRepertoirePiece,
          { 
            id: '603', 
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