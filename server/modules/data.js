function hasDuplicates(arr) {
    return new Set(arr).size !== arr.length;
}

module.exports = {hasDuplicates}