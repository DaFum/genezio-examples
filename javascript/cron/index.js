import { GenezioDeploy, GenezioMethod } from "@genezio/types"

@GenezioDeploy()
export class CronExample {
    /**
     * Method called every minute by the genezio infrastructure once the class is deployed.
     * 
     * To change the frequency with which the request is made, change the cronString in genezio.yaml configuration file.
     */

    @GenezioMethod({type: "cron", cronString: "* * * * *"})
    sayHiEveryMinute() {
        console.log("Hi!")
    }
}
