export interface Manager {
    /**
     * Registers the application & and does the initial set up.
     * @param app 
     */
    setUp(app : any) : Boolean
}