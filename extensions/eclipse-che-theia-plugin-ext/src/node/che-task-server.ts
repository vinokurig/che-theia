/*********************************************************************
 * Copyright (c) 2018 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/
import { injectable } from 'inversify';
import { TaskServerImpl } from '@theia/task/lib/node/task-server';
import { TaskConfiguration, TaskInfo } from '@theia/task/lib/common/task-protocol';

@injectable()
export class CheTaskServerImpl extends TaskServerImpl {

    async run(taskConfiguration: TaskConfiguration, ctx?: string): Promise<TaskInfo> {
        console.log('//////////////////// CheTaskServerImpl === RUN ' + taskConfiguration.label);

        if (taskConfiguration.container) {
            const runner = this.runnerRegistry.getRunner('che');
            if (!runner) {
                super.run(taskConfiguration, ctx);
            }
            const task = await runner.run(taskConfiguration, ctx);

            task.onExit(event => {
                this.taskManager.delete(task);
                this.fireTaskExitedEvent(event);
            });

            const taskInfo = await task.getRuntimeInfo();
            this.fireTaskCreatedEvent(taskInfo);
            return taskInfo;
        }

        return super.run(taskConfiguration, ctx);
    }
}
