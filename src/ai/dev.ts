import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-schedule.ts';
import '@/ai/flows/calculate-pay-stub.ts';
import '@/ai/flows/parse-schedule-email.ts';
