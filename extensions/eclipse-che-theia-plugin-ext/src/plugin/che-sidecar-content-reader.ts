/*********************************************************************
 * Copyright (c) 2018 Red Hat, Inc.
 *
 * This program and the accompanying materials are made
 * available under the terms of the Eclipse Public License 2.0
 * which is available at https://www.eclipse.org/legal/epl-2.0/
 *
 * SPDX-License-Identifier: EPL-2.0
 **********************************************************************/
import { RPCProtocol } from '@theia/plugin-ext/lib/common/rpc-protocol';
import * as fs from 'fs-extra';
import URI from 'vscode-uri';
import { CheSideCarContentReader, PLUGIN_RPC_CONTEXT } from '../common/che-protocol';

export class CheSideCarContentReaderImpl implements CheSideCarContentReader {
    constructor(rpc: RPCProtocol) {
        const scheme = 'file-sidecar-' + process.env.CHE_MACHINE_NAME;
        const delegate = rpc.getProxy(PLUGIN_RPC_CONTEXT.CHE_SIDERCAR_CONTENT_READER_MAIN);
        delegate.$registerContentReader(scheme);
    }

    async $read(uri: string, options?: { encoding?: string }): Promise<string | undefined> {
        console.info(`Request to read content remotely ${uri}`);

        const _uri = URI.parse(uri);
        if (fs.pathExistsSync(_uri.fsPath)) {
            return fs.readFileSync(_uri.fsPath, options).toString();
        }
    }
}
