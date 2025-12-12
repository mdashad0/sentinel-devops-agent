#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import figlet from 'figlet';
import { showStatus, runAction, generateReport } from './src/commands.js';

const program = new Command();

console.log(
    chalk.cyan(
        figlet.textSync('Sentinel', { horizontalLayout: 'full' })
    )
);

program
    .version('1.0.0')
    .description('Autonomous DevOps Agent CLI');

// Command: sentinel status
program
    .command('status')
    .description('Show live health status of all services')
    .action(showStatus);

// Command: sentinel simulate <service> <mode>
program
    .command('simulate')
    .description('Simulate a failure (e.g., sentinel simulate auth down)')
    .argument('<service>', 'Service name (auth, payment, notification)')
    .argument('<mode>', 'Mode (down, slow, healthy)')
    .action((service, mode) => {
        // Map "down" to the backend action logic
        runAction(service, mode);
    });

// Command: sentinel heal <service>
program
    .command('heal')
    .description('Trigger auto-healing for a service')
    .argument('<service>', 'Service name')
    .action((service) => {
        runAction(service, 'heal');
    });

// Command: sentinel report
program
    .command('report')
    .description('Generate AI Incident Report markdown file')
    .action(generateReport);

program.parse(process.argv);
