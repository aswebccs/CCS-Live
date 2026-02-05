// Profile Header Component with Banner and Profile Picture
export const ProfileHeader = ({ 
    profile, 
    displayName, 
    API_URL, 
    showEditMenu, 
    setShowEditMenu, 
    handleImageUpload, 
    clearImages, 
    setEditingIntro,
    uploadingImage = { profile: false, banner: false },
    children // For additional fields like headline and location
}) => {
    // Support both naming conventions: profile_image_url/banner_image_url (student) and logo_url/banner_url (company/school/college/university)
    const profileImageUrl = profile.profile_image_url || profile.logo_url;
    const bannerImageUrl = profile.banner_image_url || profile.banner_url;
    
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Banner Section */}
            <div className="relative bg-gray-900">
                <div className="relative h-36 sm:h-48 bg-gray-900 overflow-hidden">
                    {bannerImageUrl && (
                        <img
                            src={bannerImageUrl}
                            alt="Banner"
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>
                <button
                    onClick={() => setShowEditMenu(!showEditMenu)}
                    className="absolute top-4 right-4 bg-white hover:bg-gray-100 p-2.5 rounded-full shadow-lg transition-all duration-200"
                >
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
                
                {showEditMenu && (
                    <div className="absolute top-16 right-4 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-10">
                        <label className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors ${uploadingImage.profile ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {uploadingImage.profile ? (
                                <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            )}
                            <span className="text-sm text-gray-700 font-medium">{uploadingImage.profile ? 'Uploading...' : 'Change profile photo'}</span>
                            <input type="file" accept="image/*" className="hidden" 
                                onChange={(e) => handleImageUpload(e.target.files?.[0], 'profile')}
                                disabled={uploadingImage.profile} />
                        </label>
                        <label className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors ${uploadingImage.banner ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {uploadingImage.banner ? (
                                <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            )}
                            <span className="text-sm text-gray-700 font-medium">{uploadingImage.banner ? 'Uploading...' : 'Change banner'}</span>
                            <input type="file" accept="image/*" className="hidden"
                                onChange={(e) => handleImageUpload(e.target.files?.[0], 'banner')}
                                disabled={uploadingImage.banner} />
                        </label>
                        {(profileImageUrl || bannerImageUrl) && (
                            <button onClick={clearImages} className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 w-full text-left transition-colors">
                                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span className="text-sm text-red-600 font-medium">Remove images</span>
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Profile Info Section */}
            <div className="px-4 sm:px-6 pb-6 relative">
                {/* Profile Picture / Logo */}
                <div className="absolute -top-20">
                    <div className="relative">
                        <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-full bg-white border-4 border-white shadow-xl overflow-hidden">
                            {profileImageUrl ? (
                                <img 
                                    src={profileImageUrl} 
                                    alt="Profile" 
                                    className="w-full h-full object-cover" 
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                    <span className="text-5xl font-bold text-white">{displayName.charAt(0).toUpperCase()}</span>
                                </div>
                            )}
                        </div>
                        <label className={`absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 p-2.5 rounded-full shadow-lg cursor-pointer transition-colors ${uploadingImage.profile ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {uploadingImage.profile ? (
                                <svg className="animate-spin w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            )}
                            <input type="file" accept="image/*" className="hidden" 
                                onChange={(e) => handleImageUpload(e.target.files?.[0], 'profile')}
                                disabled={uploadingImage.profile} />
                        </label>
                    </div>
                </div>

                {/* Edit Intro Button */}
                <div className="flex justify-end pt-4 mb-12 sm:mb-20">
                    {/* <button
                        onClick={() => setEditingIntro(true)}
                        className="flex item-center gap-2 p-3 text-sm font-medium text-blue-600 border border-blue-200 hover:bg-blue-50 rounded-full transition-colors duration-200"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                    </button> */}
                </div>

                {/* Name and Details */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">{displayName}</h1>
                    {children}
                </div>
            </div>
        </div>
    );
};
