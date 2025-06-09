import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import toast from 'react-hot-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface PhoneVerificationDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    initialPhoneNumber?: string;
    onSendVerificationCode: (phoneNumber: string) => Promise<void>;
    onVerifyCode: (phoneNumber: string, code: string) => Promise<void>;
}

export default function PhoneVerificationDialog({
    isOpen,
    onOpenChange,
    initialPhoneNumber = '',
    onSendVerificationCode,
    onVerifyCode,
}: PhoneVerificationDialogProps) {
    const [phoneNumberInput, setPhoneNumberInput] = useState(initialPhoneNumber);
    const [verificationCode, setVerificationCode] = useState('');
    const [phoneError, setPhoneError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [isCodeSent, setIsCodeSent] = useState(false);

    const handleSendCode = async () => {
        setPhoneError('');
        setIsVerifying(true);
        try {
            await onSendVerificationCode(phoneNumberInput);
            toast.success('Verification code sent!');
            setIsCodeSent(true);
        } catch (error: any) {
            setPhoneError(error.data?.message || 'Failed to send verification code');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleVerifyCode = async () => {
        setPhoneError('');
        setIsVerifying(true);
        try {
            await onVerifyCode(phoneNumberInput, verificationCode);
            toast.success('Phone number verified!');
            setIsCodeSent(false);
            setPhoneNumberInput('');
            setVerificationCode('');
            onOpenChange(false);
        } catch (error: any) {
            setPhoneError(error.data?.message || 'Invalid verification code');
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            onOpenChange(open);
            if (!open) {
                setIsCodeSent(false);
                setPhoneNumberInput(initialPhoneNumber);
                setVerificationCode('');
                setPhoneError('');
            }
        }}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {isCodeSent ? 'Verify Phone Number' : 'Add Phone Number'}
                    </DialogTitle>
                </DialogHeader>
                <div className="flex w-full max-w-sm flex-col gap-6">
                    <Tabs defaultValue="addNumber">
                        <TabsList>
                            <TabsTrigger value="addNumber">Add Number</TabsTrigger>
                            <TabsTrigger value="changeNumber">Change Number</TabsTrigger>
                            <TabsTrigger value="verifyNumber">Verify Number</TabsTrigger>
                        </TabsList>
                        <TabsContent value="account">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Account</CardTitle>
                                    <CardDescription>
                                        Make changes to your account here. Click save when you&apos;re
                                        done.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-6">
                                    <div className="grid gap-3">
                                        <Label htmlFor="tabs-demo-name">Name</Label>
                                        <Input id="tabs-demo-name" defaultValue="Pedro Duarte" />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="tabs-demo-username">Username</Label>
                                        <Input id="tabs-demo-username" defaultValue="@peduarte" />
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button>Save changes</Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                        <TabsContent value="password">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Password</CardTitle>
                                    <CardDescription>
                                        Change your password here. After saving, you&apos;ll be logged
                                        out.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="grid gap-6">
                                    <div className="grid gap-3">
                                        <Label htmlFor="tabs-demo-current">Current password</Label>
                                        <Input id="tabs-demo-current" type="password" />
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="tabs-demo-new">New password</Label>
                                        <Input id="tabs-demo-new" type="password" />
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button>Save password</Button>
                                </CardFooter>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={isCodeSent ? handleVerifyCode : handleSendCode}
                        disabled={isVerifying || (!isCodeSent && !phoneNumberInput)}
                    >
                        {isVerifying
                            ? 'Processing...'
                            : isCodeSent
                                ? 'Verify Code'
                                : 'Send Code'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}