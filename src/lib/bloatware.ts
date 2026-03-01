export interface BloatwareApp {
    package: string;
    name: string;
    description: string;
    safeToRemove: boolean;
}

// A curated list of common bloatware packages
export const BLOATWARE_LIST: BloatwareApp[] = [
    // Samsung
    { package: 'com.samsung.android.bixby.agent', name: 'Bixby Voice', description: 'Samsung voice assistant', safeToRemove: true },
    { package: 'com.samsung.android.bixby.wakeup', name: 'Bixby Wakeup', description: 'Bixby wake word engine', safeToRemove: true },
    { package: 'com.samsung.android.app.spage', name: 'Bixby Home', description: 'Bixby home screen panel', safeToRemove: true },
    { package: 'com.samsung.android.game.gamehome', name: 'Game Launcher', description: 'Samsung Game Launcher', safeToRemove: true },
    { package: 'com.sec.android.app.browser', name: 'Samsung Internet', description: 'Samsung default browser', safeToRemove: true },
    { package: 'com.samsung.android.email.provider', name: 'Samsung Email', description: 'Samsung Email app', safeToRemove: true },

    // Google (often pre-installed but can be removed by users who prefer alternatives)
    { package: 'com.google.android.apps.youtube.music', name: 'YouTube Music', description: 'Google Music player', safeToRemove: true },
    { package: 'com.google.android.videos', name: 'Google TV', description: 'Google TV app', safeToRemove: true },
    { package: 'com.google.android.apps.tachyon', name: 'Google Meet', description: 'Video calling app', safeToRemove: true },
    { package: 'com.google.android.apps.podcasts', name: 'Google Podcasts', description: 'Podcast player', safeToRemove: true },

    // Xiaomi
    { package: 'com.miui.analytics', name: 'MIUI Analytics', description: 'Xiaomi tracking service', safeToRemove: true },
    { package: 'com.miui.msa.global', name: 'MIUI Ad Services', description: 'System ads service found in Xiaomi phones', safeToRemove: true },
    { package: 'com.miui.player', name: 'Mi Music', description: 'Xiaomi default music player', safeToRemove: true },
    { package: 'com.miui.videoplayer', name: 'Mi Video', description: 'Xiaomi default video player', safeToRemove: true },

    // Microsoft (often pre-installed on Samsung)
    { package: 'com.microsoft.skydrive', name: 'OneDrive', description: 'Microsoft cloud storage', safeToRemove: true },
    { package: 'com.linkedin.android', name: 'LinkedIn', description: 'Professional social network', safeToRemove: true },

    // Facebook / Meta (often pre-installed system stubs)
    { package: 'com.facebook.katana', name: 'Facebook', description: 'Facebook main app', safeToRemove: true },
    { package: 'com.facebook.system', name: 'Facebook App Installer', description: 'Installs Facebook apps in background', safeToRemove: true },
    { package: 'com.facebook.appmanager', name: 'Facebook App Manager', description: 'Manages Facebook updates', safeToRemove: true },
    { package: 'com.facebook.services', name: 'Facebook Services', description: 'Background telemetry for Facebook', safeToRemove: true },
];

export function getBloatwareInfo(packageName: string): BloatwareApp | undefined {
    return BLOATWARE_LIST.find(app => app.package === packageName);
}
