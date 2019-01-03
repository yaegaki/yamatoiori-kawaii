/**
 * 指定したミリ秒の時間を表示用の文字列に変換する
 * @param msec 
 */
export function msecToTimeStr(msec: number): string {
    let sec = Math.floor(msec / 1000);
    let s = '';
    if (sec > 3600) {
        const h = Math.floor(sec / 3600);
        sec -= h * 3600;
        s += `${h}h`;
    }
    if (sec > 60) {
        const m = Math.floor(sec / 60);
        sec -= m * 60;
        s += `${(s.length > 0 && m < 10) ? '0' : ''}${m}m`;
    }
    s += `${(s.length > 0 && sec < 10) ? '0' : ''}${sec}s`;
    return s;
}

/**
 * 日付を表示用の文字列に変換する
 * @param date 
 */
export function dateToDisplayStr(date: Date): string {
    const dayStr = '日月火水木金土';
    return `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}(${dayStr[date.getDay()]})`;
}