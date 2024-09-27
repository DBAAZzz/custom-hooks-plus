/// <reference types="@dcloudio/types" />

export declare const createProxy: (target: AnyObject) => InstanceType<ProxyConstructor>;

declare type CustomHook = (cb: (options?: any) => void, watchKey: string[] | string) => void;

declare class CustomHooks {
    private watchConfigs;
    private promiseCache;
    private promiseMap;
    private createPendingPromise;
    updateWatchedValue(key: string, value: any, parentTaget?: object): void;
    createProxy(target: AnyObject): InstanceType<ProxyConstructor>;
    init(watchObject: WatchConfigMap, target?: object): void;
    getPromiseCache(): {
        [key: string]: Promise<any>;
    };
    getPromiseMap(): PromiseMap;
    getWatchConfigs(): WatchConfigMap;
}

export declare const customHooks: CustomHooks;

/**
 * @deprecated 即将被弃用，请使用`createProxy`方法
 * @see 点击查看createProxy方法 {@link createProxy}
 */
export declare const init: (watchObject: WatchConfigMap, target?: object) => void;

export declare const onCustomCreated: CustomHook;

export declare const onCustomLaunch: CustomHook;

export declare const onCustomLoad: CustomHook;

export declare const onCustomMounted: CustomHook;

export declare const onCustomReady: CustomHook;

export declare const onCustomShow: CustomHook;

declare type PromiseEntry = {
    status: PromiseStatus;
    resolve: Function;
    type?: 'pinia' | 'default';
    onUpdate?: (val: any) => boolean;
};

declare type PromiseMap = {
    [key: string]: PromiseEntry;
};

declare enum PromiseStatus {
    /** 加载状态 */
    PEDDING = "pedding",
    /** 已完成 */
    FULFILLED = "fulfilled"
}

/**
 * @deprecated 即将被弃用，请使用`createProxy`方法
 * @see 点击查看createProxy方法 {@link createProxy}
 */
export declare const proxyData: (target: AnyObject) => InstanceType<ProxyConstructor>;

declare type Watch = {
    key: string;
    type?: 'pinia' | 'default';
    onUpdate?: (val: any) => boolean;
};

declare type WatchConfigMap = {
    [key: string]: Watch;
};

export { }
