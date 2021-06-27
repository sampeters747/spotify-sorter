export default function scale(value, maxValue) {
    const ceiling = 100;
    const scaledValue = (value / maxValue) * 100;
    return Math.min(scaledValue, ceiling)
}