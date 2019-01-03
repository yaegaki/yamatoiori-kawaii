
export function parseQueryString(search: string): Map<string, string> {
    const result = new Map<string, any>();

    if (search.length < 2) return result;

    decodeURIComponent(search.substr(1)).split('&').forEach(x => {
        const temp = x.split('=');
        if (temp.length != 2) return;
        result.set(temp[0], temp[1]);
    });

    return result;
}