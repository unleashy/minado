import { expect, test } from "vitest";
import { Random } from "../src/random";

test(".next returns the same sequence with the same seed", () => {
  const sut = new Random(42);

  const seq = Array.from({ length: 100 }).map(() => sut.next());

  expect(seq).toMatchInlineSnapshot(`
    [
      1678587472,
      616912955,
      107502490,
      1236928678,
      1439808343,
      1390793548,
      1738873634,
      360432774,
      1179675417,
      746395378,
      1410888817,
      1610230591,
      1175903704,
      420344420,
      47582123,
      852162536,
      1036226552,
      1399308173,
      1000664974,
      414064195,
      949739026,
      1620693186,
      1205634400,
      1871899967,
      215233460,
      1668859662,
      51604236,
      24174085,
      991343564,
      2132018429,
      1759590755,
      921808155,
      1850686009,
      135955089,
      944737825,
      546255106,
      1342568000,
      605285969,
      80422164,
      1706325927,
      891564205,
      1671964495,
      2045402231,
      1817187057,
      828327259,
      1740244766,
      1920165529,
      25215622,
      1916124681,
      1844076151,
      869539391,
      1599541757,
      1250393290,
      1820646770,
      556592261,
      1006599087,
      590781836,
      94903319,
      469847025,
      1875711104,
      973595816,
      1071751503,
      311517067,
      857014509,
      619930707,
      1848289912,
      1452755130,
      1168715542,
      1001314543,
      73077649,
      1519037834,
      1458204283,
      110742939,
      441313353,
      1183697755,
      1265702830,
      1958648403,
      193858158,
      1420506906,
      593652365,
      1507913256,
      34085193,
      722347780,
      1191032027,
      1063054653,
      1342912961,
      812554433,
      1530600225,
      1807074719,
      941247264,
      1154850323,
      192380013,
      1950362769,
      33700872,
      1549783218,
      1404780927,
      1742950879,
      1384944523,
      1326019036,
      62616430,
    ]
  `);
});

test(".next always returns numbers between 0 and 2**32", () => {
  const sut = new Random();

  for (let i = 0; i < 100; ++i) {
    expect(sut.next()).toBeGreaterThanOrEqual(0);
    expect(sut.next()).toBeLessThan(2 ** 32);
  }
});

test(".between always returns numbers within the bounds", () => {
  const sut = new Random();

  for (let i = 0; i < 100; ++i) {
    expect(sut.between(1, 42)).toBeGreaterThanOrEqual(1);
    expect(sut.between(1, 42)).toBeLessThan(42);
  }
});
