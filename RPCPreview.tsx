// Updated RPCPreview.tsx to properly wrap all conditional renders and ensure getStorage is called consistently.

import React from 'react';
import { getStorage } from './storage';

const RPCPreview = () => {
    const storageData = getStorage();

    return (
        <div>
            {storageData ? (
                <div>
                    {/* Conditional render based on storageData */}
                    {storageData.isAvailable ? <AvailableComponent /> : <UnavailableComponent />}
                </div>
            ) : (
                <div>Loading...</div>
            )}
        </div>
    );
};

export default RPCPreview;