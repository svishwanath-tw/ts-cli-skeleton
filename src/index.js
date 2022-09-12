//import { Collector } from './collector/collector'
const Collector  = await import('./collector/collector');

await Promise.all([new Collector().run()])
