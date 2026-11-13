// Serialises the dataset with one record per line (small file, readable git diffs).
export function formatData(d) {
  const arr = a => '[\n' + a.map(r => '  ' + JSON.stringify(r)).join(',\n') + '\n ]';
  const parts = [];
  for (const [k, v] of Object.entries(d)) {
    if (k === 'graph') parts.push(` "graph": {\n "nodes": ${arr(v.nodes)},\n "edges": ${arr(v.edges)}\n }`);
    else if (Array.isArray(v)) parts.push(` ${JSON.stringify(k)}: ${arr(v)}`);
    else parts.push(` ${JSON.stringify(k)}: ${JSON.stringify(v)}`);
  }
  return '{\n' + parts.join(',\n') + '\n}\n';
}

