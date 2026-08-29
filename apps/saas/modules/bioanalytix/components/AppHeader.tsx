"use client";

import { UserMenu } from "@shared/components/UserMenu";

import styles from "./BioanalytixShell.module.css";

interface AppHeaderProps {
	title?: string;
	description?: string;
}

export function AppHeader({ title = "Overview", description }: AppHeaderProps) {
	return (
		<header className={styles.header}>
			<div className={styles.headerText}>
				<h1 className={styles.headerTitle}>{title}</h1>

				{description ? <p className={styles.headerDescription}>{description}</p> : null}
			</div>

			<div className={styles.headerActions}>
				<UserMenu />
			</div>
		</header>
	);
}
