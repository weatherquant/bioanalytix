"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Switch } from "@repo/ui/components/switch";
import { useState } from "react";

export default function EstatePlanControls({
	retirementAge,
	includeInsurance,
	includeSpouse,
	spouseAge,
	spouseGender,
	setRetirementAge,
	setIncludeInsurance,
	setIncludeSpouse,
	setSpouseAge,
	setSpouseGender,
}) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Estate Plan Controls</CardTitle>
			</CardHeader>
			<CardContent className="space-y-6">
				<div className="space-y-2">
					<label className="text-sm font-medium">Retirement Age</label>
					<Input
						type="number"
						className="w-32"
						value={retirementAge}
						onChange={(e) => setRetirementAge(Number(e.target.value))}
					/>
				</div>

				<div className="flex items-center justify-between">
					<span>Include Term Insurance</span>
					<Switch checked={includeInsurance} onCheckedChange={setIncludeInsurance} />
				</div>

				<div className="flex items-center justify-between">
					<span>Include Spouse / Partner</span>
					<Switch checked={includeSpouse} onCheckedChange={setIncludeSpouse} />
				</div>

				{includeSpouse && (
					<div className="space-y-2">
						<label className="text-sm font-medium">Spouse Age</label>
						<Input
							type="number"
							className="w-32"
							value={spouseAge}
							onChange={(e) => setSpouseAge(Number(e.target.value))}
						/>
					</div>
				)}

				{includeSpouse && (
					<div className="space-y-2">
						<label className="text-sm font-medium">Spouse Gender</label>
						<select
							className="p-2 rounded w-32 border"
							value={spouseGender}
							onChange={(e) => setSpouseGender(e.target.value as "male" | "female")}
						>
							<option value="female">Female</option>
							<option value="male">Male</option>
						</select>
						<p className="text-sm text-muted-foreground">
							{spouseGender === "female"
								? "Female life expectancy applied."
								: "Male life expectancy applied."}
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
