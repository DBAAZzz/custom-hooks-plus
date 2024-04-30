/// <reference types="@dcloudio/types" />

/**
 *
 * @param watch 监听的键
 * @param target 传入的store
 */
export declare function init(watchObject: WatchType, target?: object): void;

export declare let keyPromise: {
    [key: string]: Promise<any>;
};

export declare const onCustomCreated: (cb: () => void, watchKey: Array<string> | string) => void;

export declare const onCustomLaunch: (cb: (options?: App.LaunchShowOption) => void, watchKey: Array<string> | string) => void;

export declare const onCustomLoad: (cb: (options?: AnyObject) => void, watchKey: Array<string> | string) => void;

export declare const onCustomMounted: (cb: () => void, watchKey: Array<string> | string) => void;

export declare const onCustomReady: (cb: () => void, watchKey: Array<string> | string) => void;

export declare const onCustomShow: (cb: () => void, watchKey: Array<string> | string) => void;

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
