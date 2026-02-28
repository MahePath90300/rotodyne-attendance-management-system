export function buildMonthOptions(yearsBack = 2) {
  const list = [];
  const now = new Date();

  for (let y = now.getFullYear(); y >= now.getFullYear() - yearsBack; y--) {
    for (let m = 12; m >= 1; m--) {
      list.push({
        value: `${y}-${m}`,
        label: `${new Date(y, m - 1).toLocaleString("default", {
          month: "long",
        })} ${y}`,
        year: y,
        month: m,
      });
    }
  }

  return list;
}
