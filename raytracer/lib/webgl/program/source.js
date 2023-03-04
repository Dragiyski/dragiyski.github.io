const instruction_list = [];

export function registerInstruction(definition) {
    const index = instruction_list.length;
    instruction_list.push(definition);
    return index;
}
