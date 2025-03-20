/**
 * Mock repertoire data for testing and development
 */
export const repertoire = [
  {
    id: '',  // This will be filled in during migration
    title: 'Violin Concerto in E minor, Op. 64',
    composer: 'Felix Mendelssohn',
    arranger: null,
    level: 'advanced',
    description: 'One of the most frequently performed violin concertos in history.',
    genre: 'Classical',
    files: [
      {
        name: 'Mendelssohn_Violin_Concerto_Score.pdf',
        url: 'https://example.com/scores/mendelssohn.pdf',
        type: 'score',
        size: 1245000,
        description: 'Full orchestral score'
      },
      {
        name: 'Mendelssohn_Violin_Part.pdf',
        url: 'https://example.com/scores/mendelssohn_violin.pdf',
        type: 'part',
        size: 356000,
        description: 'Solo violin part'
      }
    ],
    links: [
      {
        title: 'Hilary Hahn performs Mendelssohn',
        url: 'https://www.youtube.com/watch?v=example1',
        type: 'youtube',
        description: 'Professional recording with orchestra',
        thumbnail: 'https://example.com/thumbnails/mendelssohn.jpg'
      },
      {
        title: 'Mendelssohn Analysis',
        url: 'https://www.musictheory.com/mendelssohn',
        type: 'article',
        description: 'Theoretical analysis of the concerto'
      }
    ]
  },
  {
    id: '',  // This will be filled in during migration
    title: 'Violin Sonata No. 1 in G minor, BWV 1001',
    composer: 'Johann Sebastian Bach',
    arranger: null,
    level: 'advanced',
    description: 'First sonata from the set of six Sonatas and Partitas for solo violin.',
    genre: 'Baroque',
    files: [
      {
        name: 'Bach_Sonata_1.pdf',
        url: 'https://example.com/scores/bach_sonata1.pdf',
        type: 'score',
        size: 782000,
        description: 'Urtext edition'
      }
    ],
    links: [
      {
        title: 'Itzhak Perlman performs Bach Sonata No. 1',
        url: 'https://www.youtube.com/watch?v=example2',
        type: 'youtube',
        description: 'Live performance',
        thumbnail: 'https://example.com/thumbnails/bach.jpg'
      }
    ]
  },
  {
    id: '',  // This will be filled in during migration
    title: 'Introduction and Rondo Capriccioso',
    composer: 'Camille Saint-Saëns',
    arranger: null,
    level: 'advanced',
    description: 'A challenging showpiece for violin and orchestra.',
    genre: 'Romantic',
    files: [
      {
        name: 'Saint_Saens_Intro_Rondo.pdf',
        url: 'https://example.com/scores/saint_saens.pdf',
        type: 'score',
        size: 945000,
        description: 'Piano reduction'
      }
    ],
    links: [
      {
        title: 'Joshua Bell performs Saint-Saëns',
        url: 'https://www.youtube.com/watch?v=example3',
        type: 'youtube',
        description: 'Professional recording with orchestra',
        thumbnail: 'https://example.com/thumbnails/saint_saens.jpg'
      }
    ]
  },
  {
    id: '',  // This will be filled in during migration
    title: 'Suzuki Violin School Volume 1',
    composer: 'Various',
    arranger: 'Shinichi Suzuki',
    level: 'beginner',
    description: 'Foundational pieces for beginning violin students.',
    genre: 'Educational',
    files: [
      {
        name: 'Suzuki_Vol1.pdf',
        url: 'https://example.com/scores/suzuki_vol1.pdf',
        type: 'book',
        size: 358000,
        description: 'Complete book with piano accompaniment'
      }
    ],
    links: [
      {
        title: 'Suzuki Method Overview',
        url: 'https://www.suzukiassociation.org/about/suzuki-method/',
        type: 'article',
        description: 'Information about the Suzuki Method'
      }
    ]
  },
  {
    id: '',  // This will be filled in during migration
    title: 'The Four Seasons - "Spring"',
    composer: 'Antonio Vivaldi',
    arranger: null,
    level: 'intermediate',
    description: 'First concerto from The Four Seasons set.',
    genre: 'Baroque',
    files: [
      {
        name: 'Vivaldi_Spring.pdf',
        url: 'https://example.com/scores/vivaldi_spring.pdf',
        type: 'score',
        size: 684000,
        description: 'Full score with parts'
      }
    ],
    links: [
      {
        title: 'Anne-Sophie Mutter performs Vivaldi Spring',
        url: 'https://www.youtube.com/watch?v=example4',
        type: 'youtube',
        description: 'Professional recording',
        thumbnail: 'https://example.com/thumbnails/vivaldi.jpg'
      }
    ]
  }
]; 