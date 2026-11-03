import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    ImageIcon,
    ShieldCheck,
    ShoppingBag,
    ShoppingCart,
    Star,
    Tag,
    Truck,
} from 'lucide-react';
import { login, register } from '@/routes';
import type { Category, Product } from '@/types';

interface Props {
    featured: Product[];
    categories: Category[];
}

const FEATURES = [
    {
        icon: ShoppingBag,
        title: 'Real variants, real stock',
        description:
            'Pick a size and color and watch the price and stock update live — every variant is tracked, down to the last unit.',
    },
    {
        icon: Truck,
        title: 'Order tracking that means something',
        description:
            'From paid to processing to shipped to delivered, with a tracking number the moment it ships — not a guess.',
    },
    {
        icon: Tag,
        title: 'Coupons that actually add up',
        description:
            'Percent or fixed discounts, applied at checkout and capped so a code can never make an order go negative.',
    },
    {
        icon: ShieldCheck,
        title: 'Reviews you can trust',
        description:
            'Only customers whose order actually arrived can leave a review — no drive-by ratings from people who never bought a thing.',
    },
];

export default function Welcome({ featured, categories }: Props) {
    const { auth, cartCount } = usePage<{ cartCount: number }>().props;

    return (
        <>
            <Head title="Cartify — Shop with confidence" />
            <div className="min-h-screen bg-[#FFFBF5] text-[#1c1206] dark:bg-[#0d0a06] dark:text-[#f5ede1]">
                <header className="mx-auto flex max-w-6xl items-center gap-6 p-6">
                    <Link
                        href="/"
                        className="flex items-center gap-2 font-semibold"
                    >
                        <ShoppingBag className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        Cartify
                    </Link>

                    <nav className="hidden flex-1 items-center gap-6 text-sm sm:flex">
                        <Link
                            href="/shop"
                            className="text-[#5c4a34] hover:text-[#1c1206] dark:text-[#c9b79d] dark:hover:text-[#f5ede1]"
                        >
                            Shop
                        </Link>
                        <a
                            href="#featured"
                            className="text-[#5c4a34] hover:text-[#1c1206] dark:text-[#c9b79d] dark:hover:text-[#f5ede1]"
                        >
                            Best sellers
                        </a>
                    </nav>

                    <div className="ml-auto flex items-center gap-3 text-sm">
                        {/* The cart works for guests too, so the badge belongs here as
                            much as it does inside the storefront layout. */}
                        <Link
                            href="/cart"
                            className="relative rounded-md p-2 hover:bg-amber-900/5 dark:hover:bg-amber-100/10"
                            title="Cart"
                        >
                            <ShoppingCart className="h-5 w-5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-600 text-[10px] font-medium text-white dark:bg-amber-500">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {auth.user ? (
                            <Link
                                href="/shop"
                                className="inline-block rounded-md bg-amber-600 px-5 py-1.5 leading-normal text-white hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400"
                            >
                                Shop
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="hidden rounded-md border border-transparent px-4 py-1.5 leading-normal hover:border-amber-900/20 sm:inline-block dark:hover:border-amber-100/20"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href={register()}
                                    className="inline-block rounded-md border border-amber-900/15 px-4 py-1.5 leading-normal hover:border-amber-900/35 dark:border-amber-100/15 dark:hover:border-amber-100/35"
                                >
                                    Sign up
                                </Link>
                            </>
                        )}
                    </div>
                </header>

                <main className="mx-auto max-w-6xl px-6 pt-12 pb-24">
                    {/* ── Hero — every path out of here leads to the shop ── */}
                    <section className="mx-auto max-w-3xl text-center">
                        <h1 className="text-4xl leading-tight font-bold sm:text-5xl">
                            Shop the details,{' '}
                            <span className="text-amber-600 dark:text-amber-400">
                                not the guesswork.
                            </span>
                        </h1>
                        <p className="mx-auto mt-4 max-w-2xl text-lg text-[#5c4a34] dark:text-[#c9b79d]">
                            Real stock tracked per size and color, real order
                            status from payment to your doorstep, and reviews
                            only from buyers whose order actually arrived.
                        </p>
                        <div className="mt-8 flex flex-wrap justify-center gap-3">
                            <Link
                                href="/shop"
                                className="inline-flex items-center gap-2 rounded-md bg-amber-600 px-7 py-3 text-sm font-medium text-white hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400"
                            >
                                Start shopping
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                            <a
                                href="#featured"
                                className="inline-block rounded-md border border-amber-900/15 px-7 py-3 text-sm font-medium hover:border-amber-900/35 dark:border-amber-100/15 dark:hover:border-amber-100/35"
                            >
                                See best sellers
                            </a>
                        </div>
                        {!auth.user && (
                            <p className="mt-4 text-sm text-[#5c4a34] dark:text-[#c9b79d]">
                                Browse and fill your cart as a guest — you only
                                need an account at checkout.
                            </p>
                        )}
                    </section>

                    {/* ── Categories, straight into the shop's filters ── */}
                    {categories.length > 0 && (
                        <section className="mt-12 flex flex-wrap justify-center gap-2">
                            <Link
                                href="/shop"
                                className="rounded-full border border-amber-900/15 px-4 py-1.5 text-sm hover:border-amber-900/35 hover:bg-amber-900/5 dark:border-amber-100/15 dark:hover:border-amber-100/35 dark:hover:bg-amber-100/5"
                            >
                                All products
                            </Link>
                            {categories.map((category) => (
                                <Link
                                    key={category.id}
                                    href={`/shop?category=${category.slug}`}
                                    className="rounded-full border border-amber-900/15 px-4 py-1.5 text-sm hover:border-amber-900/35 hover:bg-amber-900/5 dark:border-amber-100/15 dark:hover:border-amber-100/35 dark:hover:bg-amber-100/5"
                                >
                                    {category.name}
                                    {(category.products_count ?? 0) > 0 && (
                                        <span className="ml-1.5 text-[#5c4a34] dark:text-[#c9b79d]">
                                            {category.products_count}
                                        </span>
                                    )}
                                </Link>
                            ))}
                        </section>
                    )}

                    {/* ── Real products, so the front page is the shop's front door ── */}
                    {featured.length > 0 && (
                        <section id="featured" className="mt-20 scroll-mt-8">
                            <div className="flex items-end justify-between">
                                <h2 className="text-2xl font-bold">
                                    Best sellers
                                </h2>
                                <Link
                                    href="/shop"
                                    className="inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:underline dark:text-amber-400"
                                >
                                    View all products
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>

                            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                {featured.map((product) => (
                                    <Link
                                        key={product.id}
                                        href={`/products/${product.slug}`}
                                        className="group rounded-xl border border-amber-900/10 bg-white p-4 transition-shadow hover:shadow-md dark:border-amber-100/10 dark:bg-[#171008]"
                                    >
                                        <div className="mb-3 flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-amber-900/5 dark:bg-amber-100/5">
                                            {product.cover_url ? (
                                                <img
                                                    src={product.cover_url}
                                                    alt={product.name}
                                                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                                />
                                            ) : (
                                                <ImageIcon className="h-8 w-8 text-amber-900/20 dark:text-amber-100/20" />
                                            )}
                                        </div>
                                        <p className="font-medium">
                                            {product.name}
                                        </p>
                                        <p className="text-xs text-[#5c4a34] dark:text-[#c9b79d]">
                                            {product.category?.name}
                                        </p>
                                        <div className="mt-2 flex items-center justify-between">
                                            <span className="font-semibold">
                                                ${product.base_price}
                                            </span>
                                            {(product.reviews_count ?? 0) >
                                                0 && (
                                                <span className="flex items-center gap-1 text-xs text-[#5c4a34] dark:text-[#c9b79d]">
                                                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                                    {Number(
                                                        product.reviews_avg_rating,
                                                    ).toFixed(1)}{' '}
                                                    ({product.reviews_count})
                                                </span>
                                            )}
                                        </div>
                                        {!product.in_stock && (
                                            <p className="mt-1 text-xs font-medium text-rose-500">
                                                Out of stock
                                            </p>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    <section id="features" className="mt-24">
                        <h2 className="text-center text-2xl font-bold">
                            Built for how people actually shop
                        </h2>
                        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {FEATURES.map((feature) => (
                                <div
                                    key={feature.title}
                                    className="rounded-xl border border-amber-900/10 p-5 dark:border-amber-100/10"
                                >
                                    <feature.icon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                                    <h3 className="mt-3 font-semibold">
                                        {feature.title}
                                    </h3>
                                    <p className="mt-1 text-sm text-[#5c4a34] dark:text-[#c9b79d]">
                                        {feature.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="mt-20 rounded-2xl border border-amber-900/10 bg-white px-6 py-12 text-center dark:border-amber-100/10 dark:bg-[#171008]">
                        <h2 className="text-2xl font-bold">
                            Ready when you are.
                        </h2>
                        <p className="mx-auto mt-2 max-w-lg text-[#5c4a34] dark:text-[#c9b79d]">
                            The whole catalog is open — no sign-up wall, no
                            email required to look around.
                        </p>
                        <Link
                            href="/shop"
                            className="mt-6 inline-flex items-center gap-2 rounded-md bg-amber-600 px-7 py-3 text-sm font-medium text-white hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-400"
                        >
                            Browse the shop
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </section>
                </main>

                <footer className="border-t border-amber-900/10 py-8 text-center text-sm text-[#5c4a34] dark:border-amber-100/10 dark:text-[#c9b79d]">
                    Built with Laravel 13, React 19 and Inertia.js — a demo
                    project for learning purposes.
                </footer>
            </div>
        </>
    );
}
