import { ComponentType, ReactNode } from 'react';

interface ProviderEntry {
  provider: ComponentType<any>;
  props?: Record<string, unknown>;
}

interface ComposeProvidersProps {
  providers: ProviderEntry[];
  children: ReactNode;
}

export const ComposeProviders = ({
  providers,
  children,
}: ComposeProvidersProps) =>
  providers.reduceRight<ReactNode>(
    (acc, { provider: Provider, props }) => (
      <Provider {...props}>{acc}</Provider>
    ),
    children,
  );
