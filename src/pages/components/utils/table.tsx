import React from "react";
type Props = {
  headers: string[];
  children: any;
};

export default function Table({ headers, children }: Props) {
  //headers .... array
  return (
    <div className="overflow-x-auto w-full rounded-md  ">
      <table className="w-full h-fit max-h-[450px]">
        <thead className=" border-b border-slate-300 text-slate-300 font-medium">
          <tr>
            {headers.map((header: string, index: number) => (
              <td key={index} scope="col " className="py-4 px-1">
                {header}
              </td>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
