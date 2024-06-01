export function orderBy<T>(list: T[], key: keyof T, order: 'asc' | 'desc' = 'asc') {
    return list.sort((a, b) => {
        let comparison = 0;

        if (a[key] > b[key]) {
            comparison = 1;
        } else if (a[key] < b[key]) {
            comparison = -1;
        }

        return (order === 'desc') ? (comparison * -1) : comparison;
    });
}