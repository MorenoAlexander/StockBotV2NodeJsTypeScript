export default interface Command {
  name: string;
  description: string;
  execute: Function;
}
