export declare function processCampaign(targets: {
    url: string;
}[]): Promise<{
    results: ({
        url: string;
        status: string;
        adSlotsDetected: number;
        screenshotPath: string;
    } | {
        url: string;
        status: string;
        adSlotsDetected: number;
        screenshotPath: null;
    })[];
    summary: {
        totalUrls: number;
        successful: number;
        failed: number;
        blocked: number;
        noAdSlot: number;
        durationSeconds: number;
    };
}>;
//# sourceMappingURL=campaign.service.d.ts.map