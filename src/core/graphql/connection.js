import { objectArray, objectOrEmpty } from "../domain/coerce.js";

/**
 * @param {unknown} value
 * @param {string} root
 * @param {(node: Record<string, unknown>) => Record<string, unknown>} [adaptNode]
 * @returns {{ nodes: Record<string, unknown>[]; pageInfo: { total: number; page: number; pageSize: number; pageCount: number } }}
 */
export function adaptGraphqlConnection(value, root, adaptNode = (node) => node) {
	const connection = objectOrEmpty(objectOrEmpty(value)[root]);
	const pageInfo = objectOrEmpty(connection.pageInfo);
	return {
		nodes: objectArray(connection.nodes).map(adaptNode),
		pageInfo: {
			total: Number(pageInfo.total) || 0,
			page: Number(pageInfo.page) || 1,
			pageSize: Number(pageInfo.pageSize) || 0,
			pageCount: Number(pageInfo.pageCount) || 0
		}
	};
}
