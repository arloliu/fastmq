const Promise = require('bluebird');
const MessageBroker = require('../../lib/index.js');
const ParallelBenchmark = require('./ParallelBenchmark');
var parseArgs = require('minimist');
const options = parseArgs(process.argv.slice(2));
const Parallel = options.p || 10;
const Requests = options.n || 1000;


const bench1 = new ParallelBenchmark('test_cmd_json', {
    parallel: Parallel,
    requests: Requests,
    setup: function() {
        this.number = 1;
        return MessageBroker.Client.connect('client1', 'master')
        .then((ch) => {
            this.channel = ch;
        });
    },
    fn: function() {
        //console.log(`this.number: ${this.number}`);
        let reqData = {num: this.number++, data: 'test'};
        return this.channel.request('master', 'test_cmd_json', reqData, 'json');
    },
    verify: function(data) {
        //console.log(data);
    },
    onStart: function(target) {
        console.log(`# Run ${target.name}, parallel: ${target.parallel} requests: ${target.requests}`);
    },
    onComplete: function(stat) {
        console.log(`# Benchmark ${stat.name}: ${stat.ops} operation per sec., elapsed: ${stat.elapsed} ms`);
        this.channel.disconnect();
    },
});

const bench2 = new ParallelBenchmark('test_cmd_raw_1k', {
    parallel: Parallel,
    requests: Requests,
    setup: function() {
        this.rawData = Buffer.allocUnsafe(1024);
        return MessageBroker.Client.connect('client1', 'master')
        .then((ch) => {
            this.channel = ch;
        });
    },
    fn: function() {
        //console.log(`this.number: ${this.number}`);
        //let reqData = {num: this.number++, data: 'test'};
        return this.channel.request('master', 'test_cmd_raw', this.rawData, 'raw');
    },
    verify: function(data) {
        //console.log(data);
    },
    onStart: function(target) {
        console.log(`# Run ${target.name}, parallel: ${target.parallel} requests: ${target.requests}`);
    },
    onComplete: function(stat) {
        console.log(`# Benchmark ${stat.name}: ${stat.ops} operation per sec., elapsed: ${stat.elapsed} ms`);
        this.channel.disconnect();

    },
});

bench1.run()
.then(() => {
    bench2.run();
});
