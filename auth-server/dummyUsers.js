const dummyUsers = [
    {
        firstName: 'Revathi',
        lastName: 'Varma',
        username: 'revathi0',
        email: 'revathi0@example.com',
        password: 'password123',
        mobileNumber: '7654532562',
        dateOfBirth: new Date('1991-01-16')
    },
    {
        firstName: 'Deepa',
        lastName: 'Shetty',
        username: 'deepa1',
        email: 'deepa1@example.com',
        password: 'password123',
        mobileNumber: '9181192394',
        dateOfBirth: new Date('1987-02-21')
    },
    {
        firstName: 'Vignesh',
        lastName: 'Naidu',
        username: 'vignesh2',
        email: 'vignesh2@example.com',
        password: 'password123',
        mobileNumber: '7184112153',
        dateOfBirth: new Date('1995-07-11')
    },
    {
        firstName: 'Lakshmi',
        lastName: 'Iyer',
        username: 'lakshmi3',
        email: 'lakshmi3@example.com',
        password: 'password123',
        mobileNumber: '9893228195',
        dateOfBirth: new Date('1991-01-29')
    },
    {
        firstName: 'Arun',
        lastName: 'Nair',
        username: 'arun4',
        email: 'arun4@example.com',
        password: 'password123',
        mobileNumber: '7032237459',
        dateOfBirth: new Date('2000-08-29')
    },
    {
        firstName: 'Manoj',
        lastName: 'Reddy',
        username: 'manoj5',
        email: 'manoj5@example.com',
        password: 'password123',
        mobileNumber: '8188254777',
        dateOfBirth: new Date('1996-02-24')
    },
    {
        firstName: 'Anitha',
        lastName: 'Iyengar',
        username: 'anitha6',
        email: 'anitha6@example.com',
        password: 'password123',
        mobileNumber: '6841765878',
        dateOfBirth: new Date('2001-08-03')
    },
    {
        firstName: 'Karthik',
        lastName: 'Nair',
        username: 'karthik7',
        email: 'karthik7@example.com',
        password: 'password123',
        mobileNumber: '6866874098',
        dateOfBirth: new Date('1998-07-09')
    },
    {
        firstName: 'Revathi',
        lastName: 'Rao',
        username: 'revathi8',
        email: 'revathi8@example.com',
        password: 'password123',
        mobileNumber: '6877282702',
        dateOfBirth: new Date('1998-04-06')
    },
    {
        firstName: 'Anitha',
        lastName: 'Iyengar',
        username: 'anitha9',
        email: 'anitha9@example.com',
        password: 'password123',
        mobileNumber: '7823453764',
        dateOfBirth: new Date('1985-09-18')
    },
    {
        firstName: 'Meena',
        lastName: 'Rao',
        username: 'meena10',
        email: 'meena10@example.com',
        password: 'password123',
        mobileNumber: '8127948161',
        dateOfBirth: new Date('2001-11-07')
    },
    {
        firstName: 'Anitha',
        lastName: 'Rao',
        username: 'anitha11',
        email: 'anitha11@example.com',
        password: 'password123',
        mobileNumber: '9545610694',
        dateOfBirth: new Date('2003-09-09')
    },
    {
        firstName: 'Naveen',
        lastName: 'Menon',
        username: 'naveen12',
        email: 'naveen12@example.com',
        password: 'password123',
        mobileNumber: '9612819245',
        dateOfBirth: new Date('1989-12-24')
    },
    {
        firstName: 'Bhavani',
        lastName: 'Iyer',
        username: 'bhavani13',
        email: 'bhavani13@example.com',
        password: 'password123',
        mobileNumber: '9987199795',
        dateOfBirth: new Date('1985-05-07')
    },
    {
        firstName: 'Kavya',
        lastName: 'Iyer',
        username: 'kavya14',
        email: 'kavya14@example.com',
        password: 'password123',
        mobileNumber: '6241634362',
        dateOfBirth: new Date('1986-01-21')
    },
    {
        firstName: 'Arun',
        lastName: 'Rao',
        username: 'arun15',
        email: 'arun15@example.com',
        password: 'password123',
        mobileNumber: '8841174823',
        dateOfBirth: new Date('1990-06-30')
    },
    {
        firstName: 'Divya',
        lastName: 'Varma',
        username: 'divya16',
        email: 'divya16@example.com',
        password: 'password123',
        mobileNumber: '6781136641',
        dateOfBirth: new Date('1989-05-29')
    },
    {
        firstName: 'Pradeep',
        lastName: 'Nair',
        username: 'pradeep17',
        email: 'pradeep17@example.com',
        password: 'password123',
        mobileNumber: '9273021849',
        dateOfBirth: new Date('1990-01-24')
    },
    {
        firstName: 'Pradeep',
        lastName: 'Pillai',
        username: 'pradeep18',
        email: 'pradeep18@example.com',
        password: 'password123',
        mobileNumber: '8013950266',
        dateOfBirth: new Date('1993-07-03')
    },
    {
        firstName: 'Suresh',
        lastName: 'Shetty',
        username: 'suresh19',
        email: 'suresh19@example.com',
        password: 'password123',
        mobileNumber: '7505701387',
        dateOfBirth: new Date('1997-10-13')
    },
    {
        firstName: 'Lakshmi',
        lastName: 'Pillai',
        username: 'lakshmi20',
        email: 'lakshmi20@example.com',
        password: 'password123',
        mobileNumber: '8713761479',
        dateOfBirth: new Date('1994-01-21')
    },
    {
        firstName: 'Naveen',
        lastName: 'Iyer',
        username: 'naveen21',
        email: 'naveen21@example.com',
        password: 'password123',
        mobileNumber: '8773024985',
        dateOfBirth: new Date('1993-12-31')
    },
    {
        firstName: 'Divya',
        lastName: 'Naidu',
        username: 'divya22',
        email: 'divya22@example.com',
        password: 'password123',
        mobileNumber: '6648149286',
        dateOfBirth: new Date('1987-12-30')
    },
    {
        firstName: 'Ajith',
        lastName: 'Nair',
        username: 'ajith23',
        email: 'ajith23@example.com',
        password: 'password123',
        mobileNumber: '8801871465',
        dateOfBirth: new Date('1987-12-13')
    },
    {
        firstName: 'Manoj',
        lastName: 'Rao',
        username: 'manoj24',
        email: 'manoj24@example.com',
        password: 'password123',
        mobileNumber: '7341207774',
        dateOfBirth: new Date('1995-11-27')
    },
    {
        firstName: 'Ravi',
        lastName: 'Varma',
        username: 'ravi25',
        email: 'ravi25@example.com',
        password: 'password123',
        mobileNumber: '8757879485',
        dateOfBirth: new Date('1998-07-02')
    },
    {
        firstName: 'Radha',
        lastName: 'Iyer',
        username: 'radha26',
        email: 'radha26@example.com',
        password: 'password123',
        mobileNumber: '6854186456',
        dateOfBirth: new Date('1986-10-20')
    },
    {
        firstName: 'Pradeep',
        lastName: 'Rao',
        username: 'pradeep27',
        email: 'pradeep27@example.com',
        password: 'password123',
        mobileNumber: '9134366601',
        dateOfBirth: new Date('1989-12-30')
    },
    {
        firstName: 'Deepa',
        lastName: 'Varma',
        username: 'deepa28',
        email: 'deepa28@example.com',
        password: 'password123',
        mobileNumber: '8187825500',
        dateOfBirth: new Date('1994-01-27')
    },
    {
        firstName: 'Kavya',
        lastName: 'Reddy',
        username: 'kavya29',
        email: 'kavya29@example.com',
        password: 'password123',
        mobileNumber: '7338139314',
        dateOfBirth: new Date('1987-11-25')
    },
    {
        firstName: 'Anitha',
        lastName: 'Pillai',
        username: 'anitha30',
        email: 'anitha30@example.com',
        password: 'password123',
        mobileNumber: '8988211340',
        dateOfBirth: new Date('2000-06-09')
    },
    {
        firstName: 'Vignesh',
        lastName: 'Pillai',
        username: 'vignesh31',
        email: 'vignesh31@example.com',
        password: 'password123',
        mobileNumber: '6117131329',
        dateOfBirth: new Date('1995-11-21')
    },
    {
        firstName: 'Arun',
        lastName: 'Naidu',
        username: 'arun32',
        email: 'arun32@example.com',
        password: 'password123',
        mobileNumber: '9584258438',
        dateOfBirth: new Date('1987-07-25')
    },
    {
        firstName: 'Ravi',
        lastName: 'Naidu',
        username: 'ravi33',
        email: 'ravi33@example.com',
        password: 'password123',
        mobileNumber: '8780835438',
        dateOfBirth: new Date('1997-01-28')
    },
    {
        firstName: 'Meena',
        lastName: 'Naidu',
        username: 'meena34',
        email: 'meena34@example.com',
        password: 'password123',
        mobileNumber: '8170617733',
        dateOfBirth: new Date('2003-10-24')
    },
    {
        firstName: 'Ajith',
        lastName: 'Naidu',
        username: 'ajith35',
        email: 'ajith35@example.com',
        password: 'password123',
        mobileNumber: '6170538173',
        dateOfBirth: new Date('1989-03-17')
    },
    {
        firstName: 'Sowmya',
        lastName: 'Reddy',
        username: 'sowmya36',
        email: 'sowmya36@example.com',
        password: 'password123',
        mobileNumber: '7980260788',
        dateOfBirth: new Date('1997-06-27')
    },
    {
        firstName: 'Revathi',
        lastName: 'Menon',
        username: 'revathi37',
        email: 'revathi37@example.com',
        password: 'password123',
        mobileNumber: '9092628245',
        dateOfBirth: new Date('1999-02-06')
    },
    {
        firstName: 'Arun',
        lastName: 'Iyer',
        username: 'arun38',
        email: 'arun38@example.com',
        password: 'password123',
        mobileNumber: '6563291728',
        dateOfBirth: new Date('1995-08-09')
    },
    {
        firstName: 'Kavya',
        lastName: 'Naidu',
        username: 'kavya39',
        email: 'kavya39@example.com',
        password: 'password123',
        mobileNumber: '6249217465',
        dateOfBirth: new Date('1994-12-16')
    },
    {
        firstName: 'Bhavani',
        lastName: 'Reddy',
        username: 'bhavani40',
        email: 'bhavani40@example.com',
        password: 'password123',
        mobileNumber: '7725844319',
        dateOfBirth: new Date('2004-11-11')
    },
    {
        firstName: 'Manoj',
        lastName: 'Pillai',
        username: 'manoj41',
        email: 'manoj41@example.com',
        password: 'password123',
        mobileNumber: '6615993580',
        dateOfBirth: new Date('1994-10-13')
    },
    {
        firstName: 'Pradeep',
        lastName: 'Reddy',
        username: 'pradeep42',
        email: 'pradeep42@example.com',
        password: 'password123',
        mobileNumber: '6883557377',
        dateOfBirth: new Date('2000-08-12')
    },
    {
        firstName: 'Revathi',
        lastName: 'Menon',
        username: 'revathi43',
        email: 'revathi43@example.com',
        password: 'password123',
        mobileNumber: '8727921477',
        dateOfBirth: new Date('1994-09-19')
    },
    {
        firstName: 'Meena',
        lastName: 'Iyengar',
        username: 'meena44',
        email: 'meena44@example.com',
        password: 'password123',
        mobileNumber: '8796788751',
        dateOfBirth: new Date('1989-05-27')
    },
    {
        firstName: 'Vignesh',
        lastName: 'Iyengar',
        username: 'vignesh45',
        email: 'vignesh45@example.com',
        password: 'password123',
        mobileNumber: '6962826789',
        dateOfBirth: new Date('1996-10-16')
    },
    {
        firstName: 'Meena',
        lastName: 'Rao',
        username: 'meena46',
        email: 'meena46@example.com',
        password: 'password123',
        mobileNumber: '6130527644',
        dateOfBirth: new Date('1996-09-07')
    },
    {
        firstName: 'Revathi',
        lastName: 'Shetty',
        username: 'revathi47',
        email: 'revathi47@example.com',
        password: 'password123',
        mobileNumber: '6848645761',
        dateOfBirth: new Date('2001-12-13')
    },
    {
        firstName: 'Suresh',
        lastName: 'Pillai',
        username: 'suresh48',
        email: 'suresh48@example.com',
        password: 'password123',
        mobileNumber: '8913777776',
        dateOfBirth: new Date('1987-03-16')
    },
    {
        firstName: 'Bhavani',
        lastName: 'Iyer',
        username: 'bhavani49',
        email: 'bhavani49@example.com',
        password: 'password123',
        mobileNumber: '7453108154',
        dateOfBirth: new Date('1995-12-28')
    },
    {
        firstName: 'Vignesh',
        lastName: 'Rao',
        username: 'vignesh50',
        email: 'vignesh50@example.com',
        password: 'password123',
        mobileNumber: '6837324041',
        dateOfBirth: new Date('1985-12-07')
    },
    {
        firstName: 'Anitha',
        lastName: 'Iyengar',
        username: 'anitha51',
        email: 'anitha51@example.com',
        password: 'password123',
        mobileNumber: '9283919408',
        dateOfBirth: new Date('2001-06-11')
    },
    {
        firstName: 'Meena',
        lastName: 'Reddy',
        username: 'meena52',
        email: 'meena52@example.com',
        password: 'password123',
        mobileNumber: '6024493205',
        dateOfBirth: new Date('1993-11-13')
    },
    {
        firstName: 'Meena',
        lastName: 'Reddy',
        username: 'meena53',
        email: 'meena53@example.com',
        password: 'password123',
        mobileNumber: '9465233388',
        dateOfBirth: new Date('2001-11-01')
    },
    {
        firstName: 'Suresh',
        lastName: 'Reddy',
        username: 'suresh54',
        email: 'suresh54@example.com',
        password: 'password123',
        mobileNumber: '9277248337',
        dateOfBirth: new Date('2002-08-10')
    },
    {
        firstName: 'Revathi',
        lastName: 'Iyer',
        username: 'revathi55',
        email: 'revathi55@example.com',
        password: 'password123',
        mobileNumber: '9485282993',
        dateOfBirth: new Date('1995-05-16')
    },
    {
        firstName: 'Ravi',
        lastName: 'Menon',
        username: 'ravi56',
        email: 'ravi56@example.com',
        password: 'password123',
        mobileNumber: '7104257558',
        dateOfBirth: new Date('1993-01-20')
    },
    {
        firstName: 'Divya',
        lastName: 'Iyengar',
        username: 'divya57',
        email: 'divya57@example.com',
        password: 'password123',
        mobileNumber: '8938723307',
        dateOfBirth: new Date('2002-08-03')
    },
    {
        firstName: 'Naveen',
        lastName: 'Shetty',
        username: 'naveen58',
        email: 'naveen58@example.com',
        password: 'password123',
        mobileNumber: '7361257529',
        dateOfBirth: new Date('1989-04-28')
    },
    {
        firstName: 'Divya',
        lastName: 'Nair',
        username: 'divya59',
        email: 'divya59@example.com',
        password: 'password123',
        mobileNumber: '8862968720',
        dateOfBirth: new Date('1992-06-28')
    },
    {
        firstName: 'Deepa',
        lastName: 'Shetty',
        username: 'deepa60',
        email: 'deepa60@example.com',
        password: 'password123',
        mobileNumber: '8986707021',
        dateOfBirth: new Date('1995-10-23')
    },
    {
        firstName: 'Radha',
        lastName: 'Pillai',
        username: 'radha61',
        email: 'radha61@example.com',
        password: 'password123',
        mobileNumber: '8967307657',
        dateOfBirth: new Date('1985-12-10')
    },
    {
        firstName: 'Suresh',
        lastName: 'Pillai',
        username: 'suresh62',
        email: 'suresh62@example.com',
        password: 'password123',
        mobileNumber: '8287512675',
        dateOfBirth: new Date('1997-06-03')
    },
    {
        firstName: 'Anitha',
        lastName: 'Nair',
        username: 'anitha63',
        email: 'anitha63@example.com',
        password: 'password123',
        mobileNumber: '6368714852',
        dateOfBirth: new Date('1995-07-24')
    },
    {
        firstName: 'Anitha',
        lastName: 'Naidu',
        username: 'anitha64',
        email: 'anitha64@example.com',
        password: 'password123',
        mobileNumber: '7169307131',
        dateOfBirth: new Date('1986-06-19')
    },
    {
        firstName: 'Radha',
        lastName: 'Shetty',
        username: 'radha65',
        email: 'radha65@example.com',
        password: 'password123',
        mobileNumber: '6769875168',
        dateOfBirth: new Date('2002-09-16')
    },
    {
        firstName: 'Radha',
        lastName: 'Naidu',
        username: 'radha66',
        email: 'radha66@example.com',
        password: 'password123',
        mobileNumber: '9010817537',
        dateOfBirth: new Date('1999-01-31')
    },
    {
        firstName: 'Divya',
        lastName: 'Iyengar',
        username: 'divya67',
        email: 'divya67@example.com',
        password: 'password123',
        mobileNumber: '9833314484',
        dateOfBirth: new Date('1997-05-22')
    },
    {
        firstName: 'Kavya',
        lastName: 'Reddy',
        username: 'kavya68',
        email: 'kavya68@example.com',
        password: 'password123',
        mobileNumber: '6683228910',
        dateOfBirth: new Date('1986-07-06')
    },
    {
        firstName: 'Arun',
        lastName: 'Naidu',
        username: 'arun69',
        email: 'arun69@example.com',
        password: 'password123',
        mobileNumber: '8026475274',
        dateOfBirth: new Date('1987-02-10')
    },
    {
        firstName: 'Bhavani',
        lastName: 'Shetty',
        username: 'bhavani70',
        email: 'bhavani70@example.com',
        password: 'password123',
        mobileNumber: '6228603063',
        dateOfBirth: new Date('1994-04-03')
    },
    {
        firstName: 'Deepa',
        lastName: 'Shetty',
        username: 'deepa71',
        email: 'deepa71@example.com',
        password: 'password123',
        mobileNumber: '9445986652',
        dateOfBirth: new Date('2002-09-20')
    },
    {
        firstName: 'Suresh',
        lastName: 'Menon',
        username: 'suresh72',
        email: 'suresh72@example.com',
        password: 'password123',
        mobileNumber: '6977090664',
        dateOfBirth: new Date('1994-08-22')
    },
    {
        firstName: 'Bhavani',
        lastName: 'Pillai',
        username: 'bhavani73',
        email: 'bhavani73@example.com',
        password: 'password123',
        mobileNumber: '6206972051',
        dateOfBirth: new Date('1995-10-17')
    },
    {
        firstName: 'Anil',
        lastName: 'Reddy',
        username: 'anil74',
        email: 'anil74@example.com',
        password: 'password123',
        mobileNumber: '7085982413',
        dateOfBirth: new Date('2004-07-20')
    },
    {
        firstName: 'Deepa',
        lastName: 'Pillai',
        username: 'deepa75',
        email: 'deepa75@example.com',
        password: 'password123',
        mobileNumber: '8403027096',
        dateOfBirth: new Date('1987-07-09')
    },
    {
        firstName: 'Ajith',
        lastName: 'Nair',
        username: 'ajith76',
        email: 'ajith76@example.com',
        password: 'password123',
        mobileNumber: '8931208785',
        dateOfBirth: new Date('1997-12-14')
    },
    {
        firstName: 'Naveen',
        lastName: 'Naidu',
        username: 'naveen77',
        email: 'naveen77@example.com',
        password: 'password123',
        mobileNumber: '9168257010',
        dateOfBirth: new Date('1997-09-20')
    },
    {
        firstName: 'Pradeep',
        lastName: 'Iyer',
        username: 'pradeep78',
        email: 'pradeep78@example.com',
        password: 'password123',
        mobileNumber: '6986332501',
        dateOfBirth: new Date('1985-03-15')
    },
    {
        firstName: 'Ajith',
        lastName: 'Reddy',
        username: 'ajith79',
        email: 'ajith79@example.com',
        password: 'password123',
        mobileNumber: '7040720504',
        dateOfBirth: new Date('1993-10-19')
    },
    {
        firstName: 'Arun',
        lastName: 'Iyengar',
        username: 'arun80',
        email: 'arun80@example.com',
        password: 'password123',
        mobileNumber: '6991635053',
        dateOfBirth: new Date('1986-08-19')
    },
    {
        firstName: 'Karthik',
        lastName: 'Varma',
        username: 'karthik81',
        email: 'karthik81@example.com',
        password: 'password123',
        mobileNumber: '7578242074',
        dateOfBirth: new Date('1991-09-06')
    },
    {
        firstName: 'Sowmya',
        lastName: 'Pillai',
        username: 'sowmya82',
        email: 'sowmya82@example.com',
        password: 'password123',
        mobileNumber: '9340162772',
        dateOfBirth: new Date('1990-07-25')
    },
    {
        firstName: 'Revathi',
        lastName: 'Rao',
        username: 'revathi83',
        email: 'revathi83@example.com',
        password: 'password123',
        mobileNumber: '7671324263',
        dateOfBirth: new Date('2000-12-22')
    },
    {
        firstName: 'Lakshmi',
        lastName: 'Varma',
        username: 'lakshmi84',
        email: 'lakshmi84@example.com',
        password: 'password123',
        mobileNumber: '7150790775',
        dateOfBirth: new Date('1986-02-02')
    },
    {
        firstName: 'Arun',
        lastName: 'Naidu',
        username: 'arun85',
        email: 'arun85@example.com',
        password: 'password123',
        mobileNumber: '8300968046',
        dateOfBirth: new Date('1997-01-25')
    },
    {
        firstName: 'Karthik',
        lastName: 'Nair',
        username: 'karthik86',
        email: 'karthik86@example.com',
        password: 'password123',
        mobileNumber: '7236902685',
        dateOfBirth: new Date('1997-02-21')
    },
    {
        firstName: 'Kavya',
        lastName: 'Naidu',
        username: 'kavya87',
        email: 'kavya87@example.com',
        password: 'password123',
        mobileNumber: '6070889404',
        dateOfBirth: new Date('1990-06-28')
    },
    {
        firstName: 'Deepa',
        lastName: 'Rao',
        username: 'deepa88',
        email: 'deepa88@example.com',
        password: 'password123',
        mobileNumber: '6366142365',
        dateOfBirth: new Date('2004-07-19')
    },
    {
        firstName: 'Anitha',
        lastName: 'Reddy',
        username: 'anitha89',
        email: 'anitha89@example.com',
        password: 'password123',
        mobileNumber: '8980849302',
        dateOfBirth: new Date('1995-11-05')
    },
    {
        firstName: 'Pradeep',
        lastName: 'Varma',
        username: 'pradeep90',
        email: 'pradeep90@example.com',
        password: 'password123',
        mobileNumber: '7693255289',
        dateOfBirth: new Date('1997-03-30')
    },
    {
        firstName: 'Suresh',
        lastName: 'Nair',
        username: 'suresh91',
        email: 'suresh91@example.com',
        password: 'password123',
        mobileNumber: '9285402457',
        dateOfBirth: new Date('1989-06-05')
    },
    {
        firstName: 'Deepa',
        lastName: 'Pillai',
        username: 'deepa92',
        email: 'deepa92@example.com',
        password: 'password123',
        mobileNumber: '6111422313',
        dateOfBirth: new Date('1985-09-09')
    },
    {
        firstName: 'Arun',
        lastName: 'Varma',
        username: 'arun93',
        email: 'arun93@example.com',
        password: 'password123',
        mobileNumber: '9867854621',
        dateOfBirth: new Date('1997-11-05')
    },
    {
        firstName: 'Arun',
        lastName: 'Varma',
        username: 'arun94',
        email: 'arun94@example.com',
        password: 'password123',
        mobileNumber: '6837678834',
        dateOfBirth: new Date('2002-04-04')
    },
    {
        firstName: 'Anitha',
        lastName: 'Nair',
        username: 'anitha95',
        email: 'anitha95@example.com',
        password: 'password123',
        mobileNumber: '6758047115',
        dateOfBirth: new Date('2000-03-28')
    },
    {
        firstName: 'Bhavani',
        lastName: 'Reddy',
        username: 'bhavani96',
        email: 'bhavani96@example.com',
        password: 'password123',
        mobileNumber: '7547624523',
        dateOfBirth: new Date('1996-10-27')
    },
    {
        firstName: 'Revathi',
        lastName: 'Nair',
        username: 'revathi97',
        email: 'revathi97@example.com',
        password: 'password123',
        mobileNumber: '7036935825',
        dateOfBirth: new Date('1998-05-07')
    },
    {
        firstName: 'Revathi',
        lastName: 'Naidu',
        username: 'revathi98',
        email: 'revathi98@example.com',
        password: 'password123',
        mobileNumber: '7738400259',
        dateOfBirth: new Date('1999-03-21')
    },
    {
        firstName: 'Ravi',
        lastName: 'Iyer',
        username: 'ravi99',
        email: 'ravi99@example.com',
        password: 'password123',
        mobileNumber: '9356233051',
        dateOfBirth: new Date('1992-05-09')
    }
];

module.exports = dummyUsers;