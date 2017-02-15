'use strict'

const log = console.log
const sims = require('./sims.json').result


function logSimData(name, data) {
  let role
  if(data.options)
    if(data.options.role)
      role = data.options.role

  if (!role) {
    role = "n/a"
  }
  if (role == "Prius Challenge simulator") {

    const startDate = new Date(data.launch_date)
    const endDate = new Date(data.termination_date)
    log(name, 'user:', data.creator, 'role:', role, data.status, 'ami:', data.image, 'hardware:', data.hardware)
    log('             launch:', startDate,'termination:', endDate)
    log('\n')
  }
}


const count = sims.length
let i = count - 1
const s = sims[i]

while (i >=0) {
  const sim = sims[i]
  const data = sim.data
  logSimData(i+'/'+ count + ' ' + sim.name , data)
  i -= 1
}
