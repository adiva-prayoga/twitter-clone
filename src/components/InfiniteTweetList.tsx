import Link from "next/link"
import InfiniteScroll from "react-infinite-scroll-component"
import { ProfileImage } from "./ProfileImage"
import { useSession } from "next-auth/react"
import { VscHeart, VscHeartFilled } from "react-icons/vsc"
import { IconHoverEffect } from "./IconHoverEffect"
import { api } from "~/utils/api"

type Tweet = {
    id: string
    content: string
    createdAt: Date
    likeCount: number
    likedByMe: boolean
    user: { id: string, image: string | null, name: string | null, email: string | null }
}

type InfiniteTweetListProps = {
    isLoading: boolean
    isError: boolean
    hasMore: boolean
    fetchNewTweets: () => Promise<unknown>
    tweets?: Tweet[]
}

export function InfiniteTweetList({ tweets, isLoading, isError, fetchNewTweets, hasMore }: InfiniteTweetListProps) {
    if (isLoading) return <h1>Loading...</h1>
    if (isError) return <h1>Error...</h1>
    if (tweets == null) return null

    if (tweets == null || tweets.length === 0) {
        return <h2 className="my-4 text-center text-2x1 text-gray-500">No Tweets</h2>
    }

    return <ul>
        <InfiniteScroll
            dataLength={tweets.length}
            next={fetchNewTweets}
            hasMore={hasMore}
            loader={"Loading..."}
        >
            {tweets.map(tweet => {
                return <TweetCard key={tweet.id} {...tweet} />
            })}
        </InfiniteScroll>
    </ul>
}

const dateTimeFormatter = Intl.DateTimeFormat(undefined, { dateStyle: "medium" })

function TweetCard({ id, user, content, createdAt, likeCount, likedByMe }: Tweet) {
    const toggleLike = api.tweet.toggleLike.useMutation()

    function handleToggleLike() {
        toggleLike.mutate({ id })
    }

    return <li className="flex gap-4 border-b px-4 py-4">
        <Link href={`/profiles/${user.id}`}>
            <ProfileImage src={user.image} />
        </Link>
        <div className="flex flex-grow flex-col">
            <div className="flex gap-1 items-center">
                <Link
                    href={`/profiles/${user.id}`}
                    className="font-bold outline-none hover:underline focus-visible:underline"
                >
                    {user.name}
                </Link>
                <span className="text-sm text-gray-500">{user.email}</span>
                <span className="text-xl text-black-700 px-1">·</span>
                <span className="text-md text-gray-500">{dateTimeFormatter.format(createdAt)}</span>
            </div>
            <p className="whitespace-pre-wrap">{content}</p>
            <HeartButton onClick={handleToggleLike} isLoading={toggleLike.isLoading} likedByMe={likedByMe} likeCount={likeCount} />
        </div>
    </li>
}

type HeartButtonProps = {
    onClick: () => void
    isLoading: boolean
    likedByMe: boolean;
    likeCount: number;
}

function HeartButton({ isLoading, onClick, likedByMe, likeCount }: HeartButtonProps) {
    const session = useSession()
    const HeartIcon = likedByMe ? VscHeartFilled : VscHeart

    if (session.status != "authenticated") {
        return (
            <div className="mb-1 mt-2 flex items-center gap-3 self-start text-gray-500">
                <HeartIcon />
                <span>{likeCount}</span>
            </div>
        );
    }

    return (
        <button disabled={isLoading} onClick={onClick} className={`group items-center gap-1 self-start flex transition-colors duration-200 ${likedByMe
                ? "text-red-500"
                : "text-gray-500 hover:text-red-500 focus-visible:text-red-500"
            }`}
        >
            <IconHoverEffect red>
                <HeartIcon className={`transition-colors duration-200 ${likedByMe
                        ? "fill-red-500"
                        : "fill-gray-500 group-hover:fill-red-500 group-focus-visible:fill-red-500"
                    }`}
                />
            </IconHoverEffect>

            <span>{likeCount}</span>
        </button>
    );
}