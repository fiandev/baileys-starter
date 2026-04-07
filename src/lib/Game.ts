const constant = 100n;

export function getLevel(totalExp: bigint): number {
    if (totalExp <= 0n) return 1;

    const level = Number(totalExp / constant);
    return Math.floor(Math.sqrt(level));
}

export function getExpForLevel(level: number): bigint {
    return constant * BigInt(level) * BigInt(level);
}