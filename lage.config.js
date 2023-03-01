module.exports = {
    // Define task dependencies. Object keys are tasks that depend on the tasks in their array value.
    // https://microsoft.github.io/lage/docs/Guide/pipeline
    pipeline: {
        build: ['^build'],
        test: ['build']
    }
};
