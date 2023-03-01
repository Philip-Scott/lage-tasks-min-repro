# Lage Tasks Min Repro

This is a minimal reproduction of what I think it's a bug in the [Lage](https://github.com/microsoft/lage) task runner.

## Setup

- I have 3 packages, a "parent" package and two child packages (child1 and child2) that both have a dependency on the parent package.
- All packages have a "build" task.
- Only Child2 has a "test" task.
- The lage pipeline is configured that build depends on build of their dependencies, and test depends on build of its own package.

    ```js
    pipeline: {
        build: ['^build'],
        test: ['build']
    }
    ```

## Expected Behavior

Running `npm run test` should run the `build` task of the parent package, then the `build` task of the child2 package, and finally the `test` task of the child2 package. Since child1 does not have a `test` package, it should not be built.

```cli
$ npm run test:expected 

> lage-tasks-min-repro@1.0.0 test:expected
> lage test --to child2 --no-cache

Lage running tasks with 15 workers
Summary


Slowest targets

  parent#build - 0.36s
  child2#test - 0.27s
  child2#build - 0.27s

success: 3, skipped: 0, pending: 0, aborted: 0, failed: 0
Took a total of 0.93s to complete.
```

## Actual Behavior

Running `npm run test` is running `build` for child1, even though it does not have a `test` task. I see on the log `skipped: 2` which I think is the number of packages that do not have a `test` task.

```cli
$ npm run test 

> lage-tasks-min-repro@1.0.0 test
> lage test --no-cache

Lage running tasks with 15 workers
Summary


Slowest targets

  parent#build - 0.39s
  child2#test - 0.33s
  child2#build - 0.30s
  child1#build - 0.29s

success: 4, skipped: 2, pending: 0, aborted: 0, failed: 0
Took a total of 1.05s to complete.
```

## Summary

Running a command with lage acts as if the command exists across all packages rather than checking if a package actually has this script or not. This is a problem for pipelines trying to optimize build processes of subtasks as they are running more tasks than required.

If we wanted a validation step that ran build and test for all packages, that's where we can run more than one lage command in a row such as the `npm run build-test` example I added that runs `lage build test`.
