import type { ReactNode } from "react";

import styles from "./BioanalytixShell.module.css";

interface PageShellProps {
	children: ReactNode;
}

export function PageShell({ children }: PageShellProps) {
	return <main className={styles.page}>{children}</main>;
}
