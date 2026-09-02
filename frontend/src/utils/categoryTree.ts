import type { Category } from '../types';

export interface CategoryNode extends Category {
  children: CategoryNode[];
  /** Own questions plus every descendant's  what a container card should show. */
  totalQuestionCount: number;
}

export interface FlatCategory {
  node: CategoryNode;
  depth: number;
}

// The API returns one flat, name-sorted list; every view needs it as a tree.
// Insertion order is preserved through the Map, so children stay name-sorted.
export function buildCategoryTree(categories: Category[]): CategoryNode[] {
  const byId = new Map<number, CategoryNode>(
    categories.map((c) => [c.id, { ...c, children: [], totalQuestionCount: c.question_count }])
  );

  const roots: CategoryNode[] = [];
  for (const node of byId.values()) {
    const parent = node.parent_id !== null ? byId.get(node.parent_id) : undefined;
    // No parent, or a parent that isn't in the list: either way it renders at
    // the top rather than vanishing.
    if (parent) parent.children.push(node);
    else roots.push(node);
  }

  // Roll counts up from the leaves. `seen` keeps a cycle in the data from
  // hanging the render, even though the API refuses to create one.
  const seen = new Set<number>();
  function rollUp(node: CategoryNode): number {
    if (seen.has(node.id)) return 0;
    seen.add(node.id);
    node.totalQuestionCount =
      node.question_count + node.children.reduce((sum, child) => sum + rollUp(child), 0);
    return node.totalQuestionCount;
  }
  roots.forEach(rollUp);

  return roots;
}

/** Depth-first walk, each node tagged with its indentation level. */
export function flattenTree(nodes: CategoryNode[], depth = 0): FlatCategory[] {
  return nodes.flatMap((node) => [{ node, depth }, ...flattenTree(node.children, depth + 1)]);
}

export function findNode(roots: CategoryNode[], id: number): CategoryNode | undefined {
  return flattenTree(roots).find((entry) => entry.node.id === id)?.node;
}

/** Ancestors of `id`, outermost first  the order a breadcrumb reads in. */
export function getAncestors(categories: Category[], id: number): Category[] {
  const byId = new Map(categories.map((c) => [c.id, c]));

  const chain: Category[] = [];
  let current = byId.get(id)?.parent_id ?? null;
  while (current !== null && chain.length <= categories.length) {
    const parent = byId.get(current);
    if (!parent) break;
    chain.unshift(parent);
    current = parent.parent_id;
  }
  return chain;
}

export function getDescendantIds(categories: Category[], id: number): number[] {
  const childrenOf = new Map<number, Category[]>();
  for (const category of categories) {
    if (category.parent_id === null) continue;
    const siblings = childrenOf.get(category.parent_id) ?? [];
    siblings.push(category);
    childrenOf.set(category.parent_id, siblings);
  }

  const descendants: number[] = [];
  const seen = new Set([id]);
  const queue = [id];
  while (queue.length > 0) {
    for (const child of childrenOf.get(queue.shift()!) ?? []) {
      if (seen.has(child.id)) continue;
      seen.add(child.id);
      descendants.push(child.id);
      queue.push(child.id);
    }
  }
  return descendants;
}
