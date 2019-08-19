/*********************************************************************
 * Copyright (c) 2018-2019 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/

import { DebuggerContribution } from '@theia/plugin-ext/lib/common/plugin-protocol';
import { DebugExtImpl } from '@theia/plugin-ext/lib/plugin/node/debug/debug';

export class DebugContributionFilter {

    /**
     * Intercept the original method by filtering launch configurations
     */
    overrideDebuggersContributions(debugExt: DebugExtImpl) {
        const originalRegisterDebuggersContributions = debugExt.registerDebuggersContributions.bind(debugExt);

        const registerDebuggersContributions = (pluginFolder: string, contributions: DebuggerContribution[]) => {
            for (const contrib of contributions) {
                contrib.configurationSnippets = contrib.configurationSnippets.filter(snippet => !snippet.body.launch || snippet.body.launch !== 'launch');
            }

            return originalRegisterDebuggersContributions(pluginFolder, contributions);
        };

        // override debug contributions
        debugExt.registerDebuggersContributions = registerDebuggersContributions;
    }
}
