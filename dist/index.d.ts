/// <reference types="@dcloudio/types" />

declare type CustomHook = (cb: (options?: any) => void, watchKey: string[] | string) => void;

/**
 *
 * @param watch 监听的键
 * @param target 传入的store
 */
export declare function init(watchObject: WatchType, target?: object): void;

export declare let keyPromise: {
    [key: string]: Promise<any>;
};

export declare const onCustomCreated: CustomHook;

export declare const onCustomLaunch: CustomHook;

export declare const onCustomLoad: CustomHook;

export declare const onCustomMounted: CustomHook;

export declare const onCustomReady: CustomHook;

export declare const onCustomShow: CustomHook;

declare type PromiseMap = {
    [key: string]: {
        status: PromiseStatus;
        resolve: Function;
        type?: 'pinia' | 'default';
        onUpdate?: (val: any) => boolean;
    };
};

export declare let promiseMap: PromiseMap;

declare enum PromiseStatus {
    /** 加载状态 */
    PEDDING = "pedding",
    /** 已完成 */
    FULFILLED = "fulfilled"
}

export declare const proxyData: (target: AnyObject) => InstanceType<ProxyConstructor>;

declare type Watch = {
    key: string;
    type?: 'pinia' | 'default';
    onUpdate?: (val: any) => boolean;
};

export declare let watchObj: WatchType;

declare type WatchType = {
    [key: string]: Watch;
};

export { }
