import { info,warn } from "npmlog";
import { Octokit } from "@octokit/rest"
import { retry } from "@octokit/plugin-retry";
import { throttling } from "@octokit/plugin-throttling";

const ModuleName = "Collector"
const OctokitModule = "Octokit/rest"
const MyOctokit = Octokit.plugin(retry, throttling);

const myOctokit = new MyOctokit({
  auth: process.env.GITHUB_PAT,
  throttle: {
    onRateLimit: (retryAfter: any, options: any) => {
      warn(OctokitModule, 
        `Request quota exhausted for request ${options.method} ${options.url}`
      );

      if (options.request.retryCount === 0) {
        // only retries once
        myOctokit.log.info(`Retrying after ${retryAfter} seconds!`);
        return true;
      }
    },
    onAbuseLimit: (retryAfter: any, options: any) => {
      // does not retry, only logs a warning
      warn( OctokitModule, 
        `Abuse detected for request ${options.method} ${options.url}`
      );
    },
  },
  retry: {
    doNotRetry: ["429"],
  },
});

export class Collector { 
    async run() : Promise<void> {
        info(ModuleName, "started");
        const owner = "thoughtworks";
        const repo = "talisman";
        const result = await myOctokit.actions.listRepoWorkflows({owner, repo});
        info(ModuleName, JSON.stringify(result.data.workflows))
        info(ModuleName, "stopped");
    }
}


