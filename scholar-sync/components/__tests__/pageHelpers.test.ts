import {
  resolveId,
  isRecord,
  toArray,
  toLabel,
  pickValue,
  formatDate,
  booleanLabel,
  formatAttendanceEntry,
  formatCourseUser,
  combineName,
} from '../../app/dashboard/page';

describe('page helpers', () => {
  test('resolveId prefers id then _id then fallback', () => {
    expect(resolveId({ id: 5 }, 1)).toBe(5);
    expect(resolveId({ _id: 'abc' }, 2)).toBe('abc');
    expect(resolveId({}, 3)).toBe(3);
  });

  test('isRecord detects plain objects', () => {
    expect(isRecord({})).toBe(true);
    expect(isRecord(null)).toBe(false);
    expect(isRecord([])).toBe(false);
  });

  test('toArray normalizes arrays', () => {
    expect(toArray([1, 2])).toEqual([1, 2]);
    expect(toArray('nope')).toEqual([]);
  });

  test('toLabel handles primitives and objects', () => {
    expect(toLabel(' hello ')).toBe('hello');
    expect(toLabel(123)).toBe(123);
    expect(toLabel(null)).toBeNull();
    expect(toLabel({ firstName: 'Ana', lastName: 'Lopez' })).toBe('Ana Lopez');
    expect(toLabel([{ name: 'X' }, 'Y'])).toBe('X, Y');
  });

  test('pickValue returns first non-null label', () => {
    expect(pickValue(null, '', 'ok')).toBe('ok');
    expect(pickValue(undefined, 0, 'a')).toBe(0);
  });

  test('formatDate returns dash for falsy and a string for valid date', () => {
    expect(formatDate(null)).toBe('-');
    const out = formatDate('2020-01-01');
    expect(typeof out).toBe('string');
    expect(out).not.toBe('-');
  });

  test('booleanLabel maps true/false and strings', () => {
    expect(booleanLabel(true)).toBe('Si');
    expect(booleanLabel(false)).toBe('No');
    expect(booleanLabel('true')).toBe('Si');
    expect(booleanLabel('unknown')).toBe('unknown');
  });

  test('formatAttendanceEntry composes student and TA', () => {
    const entry = { student: { firstName: 'Juan', lastName: 'Perez' }, ta: { firstName: 'Ana' } };
    expect(formatAttendanceEntry(entry)).toContain('Juan Perez');
    expect(formatAttendanceEntry(entry)).toContain('TA: Ana');
  });

  test('formatCourseUser formats name with relation', () => {
    const entry = { firstName: 'Lu', lastName: 'Garcia', relationType: 'Tutor' };
    expect(formatCourseUser(entry)).toContain('Lu Garcia');
    expect(formatCourseUser(entry)).toContain('Tutor');
  });

  test('combineName trims and joins', () => {
    expect(combineName(' A ', 'B')).toBe('A B');
    expect(combineName(null, 'B')).toBe('B');
  });
});
