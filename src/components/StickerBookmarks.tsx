const StickerBookmarks = () => {
    const stickers = ['💜', '💜', '💜', '💜', '💜', '💜'];

    return (
        <div className="sticker-bookmarks">
            {stickers.map((sticker, i) => (
                <span key={i} className="bookmark-sticker">
                    {sticker}
                </span>
            ))}
        </div>
    );
};

export default StickerBookmarks;