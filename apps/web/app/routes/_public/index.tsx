import { createFileRoute } from '@tanstack/react-router';
import { createServerFn } from '@tanstack/react-start';
import { toast } from 'sonner';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { seo } from '~/lib/utils';

export const Route = createFileRoute('/_public/')({
  component: Home,
  head: () => ({
    meta: seo({ title: 'Home | Fleetfox' }),
  }),
});

const checkCrypto = createServerFn({ method: 'POST' }).handler(() => {
  const cryptoAvailable = !!globalThis.crypto;
  return { cryptoAvailable };
});

function Home() {
  return (
    <div className="p-2 grid gap-4">
      <h3>Welcome Home!!!</h3>
      <form
        className="max-w-md grid gap-4"
        onSubmit={(evt) => {
          evt.preventDefault();
          const formData = new FormData(evt.currentTarget);
          const data = Object.fromEntries(formData.entries());
          console.log('formEntries', data);
        }}
      >
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" type="text" />
        </div>
        <Button type="submit">Submit</Button>
      </form>
      <Button
        type="button"
        onClick={async () => {
          const res = await checkCrypto();
          console.log('checkCrypto', res);
        }}
      >
        Check Crypto
      </Button>
      <div>
        <Button
          type="button"
          onClick={() => {
            toast.info('Test toast');
          }}
        >
          Test toast
        </Button>
      </div>
    </div>
  );
}
