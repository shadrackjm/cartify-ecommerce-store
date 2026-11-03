import { Link, usePage } from '@inertiajs/react';
import {
    Heart,
    LogOut,
    Package,
    MapPin,
    ShoppingBag,
    ShoppingCart,
    User as UserIcon,
    LayoutGrid,
} from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Auth } from '@/types';

export default function StorefrontLayout({ children }: PropsWithChildren) {
    const { auth, cartCount } = usePage<{ auth: Auth; cartCount: number }>()
        .props;

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <header className="border-b">
                <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-4">
                    <Link
                        href="/shop"
                        className="flex items-center gap-2 text-lg font-bold"
                    >
                        <ShoppingBag className="h-6 w-6 text-primary" />
                        Cartify
                    </Link>

                    <nav className="hidden flex-1 items-center gap-6 text-sm sm:flex">
                        <Link
                            href="/shop"
                            className="text-muted-foreground hover:text-foreground"
                        >
                            Shop
                        </Link>
                    </nav>

                    <div className="ml-auto flex items-center gap-2">
                        {auth.user && (
                            <Button variant="ghost" size="icon" asChild>
                                <Link href="/wishlist" title="Wishlist">
                                    <Heart className="h-5 w-5" />
                                </Link>
                            </Button>
                        )}

                        <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="relative"
                        >
                            <Link href="/cart" title="Cart">
                                <ShoppingCart className="h-5 w-5" />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                        </Button>

                        {auth.user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <UserIcon className="h-5 w-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>
                                        {auth.user.name}
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    {auth.user.role === 'admin' && (
                                        <DropdownMenuItem asChild>
                                            <Link href="/admin/dashboard">
                                                <LayoutGrid className="mr-2 h-4 w-4" />{' '}
                                                Admin dashboard
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem asChild>
                                        <Link href="/orders">
                                            <Package className="mr-2 h-4 w-4" />{' '}
                                            My Orders
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/addresses">
                                            <MapPin className="mr-2 h-4 w-4" />{' '}
                                            Addresses
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link
                                            href="/logout"
                                            method="post"
                                            as="button"
                                            className="w-full"
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />{' '}
                                            Log out
                                        </Link>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <div className="flex items-center gap-2 text-sm">
                                <Link
                                    href="/login"
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    Log in
                                </Link>
                                <Button size="sm" asChild>
                                    <Link href="/register">Sign up</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
                {children}
            </main>

            <footer className="border-t py-8 text-center text-sm text-muted-foreground">
                Built with Laravel 13, React 19 and Inertia.js — a demo project
                for learning purposes.
            </footer>
        </div>
    );
}
