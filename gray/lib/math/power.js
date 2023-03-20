export function get_next_power_2(number) {
    let n = 1;
    let i = 0;
    while (n < number) {
        ++i;
        n = n << 1;
    }
    return 1 << i;
}

export function get_prev_power_2(number) {
    const p = get_next_power_2(number);
    if (p === number) {
        return p;
    }
    return p >> 1;
}
