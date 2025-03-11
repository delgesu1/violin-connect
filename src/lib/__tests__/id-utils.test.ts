import '@testing-library/jest-dom';

import { 
  ID_PREFIXES, 
  createPrefixedId, 
  getIdWithoutPrefix, 
  createStudentPieceId,
  isIdOfType,
  getEntityTypeFromId,
  ensureIdHasPrefix,
  idsMatch,
  IdGenerator
} from '../id-utils';

describe('ID Utilities', () => {
  describe('createPrefixedId', () => {
    test('adds the correct prefix', () => {
      expect(createPrefixedId(ID_PREFIXES.STUDENT, '1')).toBe('s-1');
      expect(createPrefixedId(ID_PREFIXES.PIECE, 42)).toBe('p-42');
      expect(createPrefixedId(ID_PREFIXES.LESSON, '101')).toBe('l-101');
    });

    test('preserves existing prefix', () => {
      expect(createPrefixedId(ID_PREFIXES.STUDENT, 's-1')).toBe('s-1');
      expect(createPrefixedId(ID_PREFIXES.PIECE, 'p-42')).toBe('p-42');
    });
  });

  describe('getIdWithoutPrefix', () => {
    test('removes the prefix correctly', () => {
      expect(getIdWithoutPrefix('s-1')).toBe('1');
      expect(getIdWithoutPrefix('p-42')).toBe('42');
      expect(getIdWithoutPrefix('l-101')).toBe('101');
    });

    test('returns original ID when no prefix exists', () => {
      expect(getIdWithoutPrefix('1')).toBe('1');
      expect(getIdWithoutPrefix('42')).toBe('42');
    });
  });

  describe('createStudentPieceId', () => {
    test('creates composite ID', () => {
      expect(createStudentPieceId('1', '2')).toBe('sp-1-2');
      expect(createStudentPieceId('s-1', 'p-2')).toBe('sp-1-2');
    });
  });

  describe('isIdOfType', () => {
    test('correctly identifies ID types', () => {
      expect(isIdOfType('s-1', ID_PREFIXES.STUDENT)).toBe(true);
      expect(isIdOfType('p-1', ID_PREFIXES.STUDENT)).toBe(false);
      expect(isIdOfType('1', ID_PREFIXES.STUDENT)).toBe(false);
    });
  });

  describe('getEntityTypeFromId', () => {
    test('identifies entity type from ID', () => {
      expect(getEntityTypeFromId('s-1')).toBe('STUDENT');
      expect(getEntityTypeFromId('p-42')).toBe('PIECE');
      expect(getEntityTypeFromId('l-101')).toBe('LESSON');
    });

    test('returns null for IDs without prefix', () => {
      expect(getEntityTypeFromId('1')).toBeNull();
      expect(getEntityTypeFromId('abc')).toBeNull();
    });
  });

  describe('ensureIdHasPrefix', () => {
    test('adds prefix when missing', () => {
      expect(ensureIdHasPrefix('1', ID_PREFIXES.STUDENT)).toBe('s-1');
      expect(ensureIdHasPrefix('42', ID_PREFIXES.PIECE)).toBe('p-42');
    });

    test('preserves correct prefix', () => {
      expect(ensureIdHasPrefix('s-1', ID_PREFIXES.STUDENT)).toBe('s-1');
      expect(ensureIdHasPrefix('p-42', ID_PREFIXES.PIECE)).toBe('p-42');
    });

    test('changes incorrect prefix', () => {
      expect(ensureIdHasPrefix('p-1', ID_PREFIXES.STUDENT)).toBe('s-1');
      expect(ensureIdHasPrefix('s-42', ID_PREFIXES.PIECE)).toBe('p-42');
    });
  });

  describe('idsMatch', () => {
    test('matches IDs ignoring prefixes', () => {
      expect(idsMatch('s-1', '1')).toBe(true);
      expect(idsMatch('p-42', '42')).toBe(true);
      expect(idsMatch('s-1', 'p-1')).toBe(true);
    });

    test('doesn\'t match different IDs', () => {
      expect(idsMatch('s-1', '2')).toBe(false);
      expect(idsMatch('p-42', '43')).toBe(false);
    });
  });

  describe('IdGenerator', () => {
    test('generates correctly prefixed IDs', () => {
      expect(IdGenerator.student('1')).toBe('s-1');
      expect(IdGenerator.piece('42')).toBe('p-42');
      expect(IdGenerator.lesson('101')).toBe('l-101');
      expect(IdGenerator.studentPiece('1', '2')).toBe('sp-1-2');
    });

    test('handles numeric IDs', () => {
      expect(IdGenerator.student(1)).toBe('s-1');
      expect(IdGenerator.piece(42)).toBe('p-42');
    });
  });
}); 