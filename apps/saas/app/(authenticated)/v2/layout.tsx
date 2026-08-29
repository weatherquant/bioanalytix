import type { PropsWithChildren } from "react";

import { AppSidebar } from "../../../modules/bioanalytix/components/AppSidebar";

import styles from "../../../modules/bioanalytix/components/BioanalytixShell.module.css";

export default function BioanalytixLayout({ children }: PropsWithChildren) {
	return (
		<div className={styles.shell}>
			<AppSidebar />

			<div className={styles.app}>{children}</div>
		</div>
	);
}
