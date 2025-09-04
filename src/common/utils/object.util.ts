

export function isEmptyObject(obj: Record<any, any>): boolean {
    return obj && Object.keys(obj).length === 0
}